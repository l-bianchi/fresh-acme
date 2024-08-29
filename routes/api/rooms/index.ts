import { FreshContext, Handlers } from "$fresh/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

export const handler: Handlers = {
  async POST(_req: Request, _ctx: FreshContext): Promise<Response> {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonPublic = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseAnonPublic) {
      const supabase = createClient(supabaseUrl, supabaseAnonPublic);
      const body = await _req.json();
      const { id } = body;

      const words = ["dog", "cat", "lion", "tiger", "penguin", "bird", "horse"];
      const prompt = words[Math.floor(Math.random() * words.length)];

      const { error, statusText } = await supabase
        .from("rooms")
        .upsert({ id, prompt });

      if (error) {
        return new Response(error.message);
      }

      const updateResult = async (user: string, time: number) => {
        const { data } = await supabase.from("rooms").select().eq("id", id);
        const results = data ? data[0].results : {};

        await supabase.from("rooms").update({
          results: {
            ...results,
            [user]: time,
          },
        })
          .eq("id", id);
      };

      if (statusText === "Created") {
        const channel = supabase.channel(id);

        channel.subscribe(async (status) => {
          if (status !== "SUBSCRIBED") {
            return null;
          }

          await channel.track({});
        });

        let time = 30;

        channel
          .on("broadcast", { event: "winner" }, ({ payload }) => {
            console.log("winner", payload.user, time);
            updateResult(payload.user.id, time);
          })
          .on("broadcast", { event: "start" }, () => {
            function timer(timeLeft: number) {
              if (timeLeft >= 0) {
                channel.send({
                  type: "broadcast",
                  event: "timer",
                  payload: { time },
                });
                time--;
                setTimeout(() => timer(time), 1000);
              } else {
                channel.send({
                  type: "broadcast",
                  event: "end",
                });
              }
            }

            timer(time);
          });
      }

      return new Response(JSON.stringify("ok"));
    }

    return new Response("Error connecting to supabase!");
  },
};

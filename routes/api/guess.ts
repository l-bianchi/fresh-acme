import { FreshContext, Handlers } from "$fresh/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

export const handler: Handlers = {
  async POST(_req: Request, _ctx: FreshContext): Promise<Response> {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonPublic = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseAnonPublic) {
      const supabase = createClient(supabaseUrl, supabaseAnonPublic);
      const body = await _req.json();
      const { room, message, user } = body;

      const { data, error } = await supabase
        .from("rooms")
        .select()
        .eq("id", room);

      if (error) {
        return new Response(error.message);
      }

      const channel = supabase.channel(room);

      channel.subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          return null;
        }

        if (data[0].prompt === message) {
          channel.send({
            type: "broadcast",
            event: "winner",
            payload: { room, message, user },
          });
        } else {
          channel.send({
            type: "broadcast",
            event: "guess",
            payload: { room, message, user },
          });
        }
      });

      return new Response(JSON.stringify("ok"));
    }

    return new Response("Error connecting to supabase!");
  },
};

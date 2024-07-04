import { FreshContext, Handlers } from "$fresh/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

export const handler: Handlers = {
  async POST(_req: Request, _ctx: FreshContext): Promise<Response> {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonPublic = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseAnonPublic) {
      const supabase = createClient(supabaseUrl, supabaseAnonPublic);
      const body = await _req.json();

      const channel = supabase.channel(body.room);

      channel.subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          return null;
        }

        channel.send({
          type: "broadcast",
          event: "message",
          payload: { message: body.message },
        });
      });

      return new Response(JSON.stringify("ok"));
    }

    return new Response("Error connecting to supabase!");
  },
};

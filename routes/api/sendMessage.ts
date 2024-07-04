import { FreshContext, Handlers } from "$fresh/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

export const handler: Handlers = {
  async POST(_req: Request, _ctx: FreshContext): Promise<Response> {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonPublic = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseAnonPublic) {
      const supabase = createClient(supabaseUrl, supabaseAnonPublic);
      const body = await _req.json();

      // Join a room/topic. Can be anything except for 'realtime'.
      const channelB = supabase.channel(body.room);

      channelB.subscribe((status) => {
        // Wait for successful connection
        if (status !== "SUBSCRIBED") {
          return null;
        }

        // Send a message once the client is subscribed
        channelB.send({
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

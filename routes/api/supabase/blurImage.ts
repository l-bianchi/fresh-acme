import { FreshContext, Handlers } from "$fresh/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

export const handler: Handlers = {
  async POST(_req: Request, _ctx: FreshContext): Promise<Response> {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonPublic = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseAnonPublic) {
      const supabase = createClient(supabaseUrl, supabaseAnonPublic);
      const body = await _req.json();
      const { room, time } = body;

      const blur = Math.floor(512 / time);

      const { data } = await supabase.storage.from("images").createSignedUrl(
        `${room}/image.png`,
        60000,
        {
          transform: {
            width: blur,
            height: blur,
          },
        },
      );

      return new Response(JSON.stringify(data?.signedUrl));
    }

    return new Response("Error connecting to supabase!");
  },
};

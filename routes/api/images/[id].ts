import { FreshContext, Handlers } from "$fresh/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";
import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

export const handler: Handlers = {
  async GET(_req: Request, _ctx: FreshContext): Promise<Response> {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonPublic = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseAnonPublic) {
      const supabase = createClient(supabaseUrl, supabaseAnonPublic);
      const id = _ctx.params.id;
      const url = new URL(_req.url);
      const time = parseInt(url.searchParams.get("time") || "1");

      const blurAmount = Math.floor(512 / (time + 1));

      const { data } = await supabase.storage.from("images").createSignedUrl(
        `${id}/image.png`,
        60000,
      );
      const signedUrl = data?.signedUrl;

      if (!signedUrl) {
        return new Response("Error generating image url!");
      }

      const response = await fetch(signedUrl);
      const arrayBuffer = await response.arrayBuffer();

      const image = await Image.decode(new Uint8Array(arrayBuffer));
      image.resize(blurAmount, blurAmount);
      const png = await image.encode();

      return new Response(png, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
        },
      });
    }

    return new Response("Error connecting to supabase!");
  },
};

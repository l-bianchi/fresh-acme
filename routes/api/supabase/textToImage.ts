import { FreshContext, Handlers } from "$fresh/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

export const handler: Handlers = {
  async POST(_req: Request, _ctx: FreshContext): Promise<Response> {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonPublic = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseAnonPublic) {
      const supabase = createClient(supabaseUrl, supabaseAnonPublic);
      const body = await _req.json();
      const { room } = body;

      const { data, error } = await supabase
        .from("rooms")
        .select()
        .eq("id", room);

      if (error) {
        return new Response(error.message);
      }

      const prompt = `Create a pencil drawing of a ${
        data[0].prompt
      }, bad drawings, shaky hands, low quality, minimal, abstract.`;

      await fetch(`${supabaseUrl}/functions/v1/${"text-to-image"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonPublic}`,
        },
        body: JSON.stringify({
          prompt,
          path: room,
          word: data[0].prompt,
        }),
      });

      return new Response(JSON.stringify("ok"));
    }

    return new Response("Error connecting to supabase!");
  },
};

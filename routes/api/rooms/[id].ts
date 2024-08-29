import { FreshContext, Handlers } from "$fresh/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

export const handler: Handlers = {
  async GET(_req: Request, _ctx: FreshContext): Promise<Response> {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonPublic = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseAnonPublic) {
      const supabase = createClient(supabaseUrl, supabaseAnonPublic);
      const id = _ctx.params.id;

      const { data, error } = await supabase
        .from("rooms")
        .select()
        .eq("id", id);

      if (error) {
        return new Response(error.message);
      }

      return new Response(JSON.stringify(data[0]));
    }

    return new Response("Error connecting to supabase!");
  },
  async PATCH(_req: Request, _ctx: FreshContext): Promise<Response> {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonPublic = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseAnonPublic) {
      const supabase = createClient(supabaseUrl, supabaseAnonPublic);
      const body = await _req.json();
      const id = _ctx.params.id;
      const { users } = body;

      const { error } = await supabase
        .from("rooms")
        .update({
          players: users.length,
          results: Object.fromEntries(
            users.map(({ id }: { id: string }) => [id, 0]),
          ),
        })
        .eq("id", id);

      if (error) {
        return new Response(error.message);
      }

      return new Response(JSON.stringify("ok"));
    }

    return new Response("Error connecting to supabase!");
  },
};

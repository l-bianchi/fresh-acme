import { PageProps } from "$fresh/server.ts";
import Game from "../islands/Game.tsx";
import Lobby from "../islands/Lobby.tsx";

export default function Room({ params }: PageProps) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_PUBLIC") ?? "";

  const { room } = params;

  return (
    <div class="flex size-full gap-8 p-8">
      <div class="w-2/3 p-8 border-2 rounded border-mocha-surface0 bg-mocha-crust">
        <Game url={supabaseUrl} room={room} />
      </div>
      <div class="w-1/3 p-8 border-2 rounded border-mocha-surface0 bg-mocha-crust">
        <Lobby url={supabaseUrl} anon={supabaseAnon} room={room} />
      </div>
    </div>
  );
}

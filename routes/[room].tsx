import { PageProps } from "$fresh/server.ts";
import { Button } from "../components/Button.tsx";
import Share from "../islands/Share.tsx";
import Lobby from "../islands/Lobby.tsx";

export default function Room({ params }: PageProps) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_PUBLIC") ?? "";

  const { room } = params;
  // const imageUrl =
  //   `${supabaseUrl}/storage/v1/object/public/images/${params.room}/image.png`;

  return (
    <div class="flex size-full gap-8 p-8">
      {
        /* <img
        class="h-auto max-h-full max-w-full rounded aspect-square animate-pulse"
        src={imageUrl}
        alt="generation preview"
      /> */
      }

      <div class="w-1/3 p-8 flex flex-col gap-4 items-center justify-center border-2 rounded border-mocha-surface0 bg-mocha-crust">
        <Share room={room} />
        <Button>Start</Button>
      </div>
      <div class="w-2/3 p-8 border-2 rounded border-mocha-surface0 bg-mocha-crust">
        <Lobby url={supabaseUrl} anon={supabaseAnon} room={room} />
      </div>
    </div>
  );
}

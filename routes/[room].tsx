import { PageProps } from "$fresh/server.ts";

export default function Room({ params }: PageProps) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

  const imageUrl =
    `${supabaseUrl}/storage/v1/object/public/images/${params.room}/image.png`;

  return (
    <div class="flex size-full items-center justify-center">
      <img
        class="h-auto max-h-full max-w-full rounded aspect-square animate-pulse"
        src={imageUrl}
        alt="generation preview"
      />
    </div>
  );
}

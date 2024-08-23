import { PageProps } from "$fresh/server.ts";
import Room from "../islands/Room.tsx";

export default function RoomPage({ params }: PageProps) {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_PUBLIC") ?? "";

  const { id } = params;

  return <Room id={id} url={url} anon={anon} />;
}

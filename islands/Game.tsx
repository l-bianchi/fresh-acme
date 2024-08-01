import { useEffect, useState } from "preact/hooks";
import Share from "./Share.tsx";
import { Button } from "../components/Button.tsx";
import { state, setGameStarted } from "../stores/game.ts";

interface GameProps {
  room: string;
  url: string;
}

export default function Game({ room, url }: GameProps) {
  const { gameStarted } = state();

  const imageUrl = `${url}/storage/v1/object/public/images/${room}/image.png`;

  useEffect(() => {
    // TODO: on mount

    return () => {
      // TODO: destroy
    };
  }, []);

  async function startGame() {
    const response = await fetch("/api/supabase/textToImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    setGameStarted(true);
  }

  return (
    <div class="size-full">
      {gameStarted ? (
        <div class="flex size-full items-center justify-center">
          <img
            class="h-auto max-h-full max-w-full rounded aspect-square animate-pulse"
            src={imageUrl}
            alt="generation preview"
          />
        </div>
      ) : (
        <div class="flex flex-col gap-4 items-center justify-center">
          <Share room={room} />
          <Button onClick={startGame}>Start</Button>
        </div>
      )}
    </div>
  );
}

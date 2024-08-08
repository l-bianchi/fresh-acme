import { useEffect, useState } from "preact/hooks";
import Share from "./Share.tsx";
import { Button } from "../components/Button.tsx";
import { state } from "../stores/game.ts";

interface GameProps {
  room: string;
}

export default function Game({ room }: GameProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const { gameStarted, time, users } = state();

  useEffect(() => {
    async function getImage() {
      setImageUrl(await getSignedUrl());
    }

    getImage();

    return () => {
      // TODO: destroy
    };
  }, [time]);

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

    await fetch(`/api/rooms/${room}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ users }),
    });

    await fetch("/api/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room, event: "start" }),
    });

    setImageUrl(await getSignedUrl());
  }

  async function getSignedUrl() {
    const response = await fetch("/api/supabase/blurImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room, time }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  }

  return (
    <div class="size-full">
      {gameStarted
        ? (
          <div class="flex size-full items-center justify-center">
            <img
              class="size-full rounded aspect-square"
              src={imageUrl}
              alt="generation preview"
            />
          </div>
        )
        : (
          <div class="flex flex-col gap-4 items-center justify-center">
            <Share room={room} />
            <Button onClick={startGame}>Start</Button>
          </div>
        )}
    </div>
  );
}

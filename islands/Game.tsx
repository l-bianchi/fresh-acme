import { useEffect, useState } from "preact/hooks";
import Share from "./Share.tsx";
import { Button } from "../components/Button.tsx";
import { Timer } from "../components/Timer.tsx";
import { state } from "../stores/game.ts";

interface GameProps {
  room: string;
  host: boolean;
}

export default function Game({ room, host }: GameProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const { gameStarted, time, users } = state();

  useEffect(() => {
    function getImage() {
      setImageUrl(`/api/images/${room}?time=${time}`);
    }

    getImage();

    return () => {
      // TODO: destroy
    };
  }, [time]);

  async function startGame() {
    await fetch("/api/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room, event: "loading" }),
    });

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

    setImageUrl(`/api/images/${room}?time=${time}`);
  }

  return (
    <div class="size-full p-4">
      {gameStarted
        ? (
          <div class="flex flex-col size-full gap-4 items-center justify-center">
            <Timer time={time} />
            <img
              class="size-full rounded aspect-square"
              src={imageUrl}
              alt="generation preview"
            />
          </div>
        )
        : (
          <div class="flex flex-col size-full gap-4 items-center justify-center">
            <Share room={room} />
            {host && <Button onClick={startGame}>Start</Button>}
          </div>
        )}
    </div>
  );
}

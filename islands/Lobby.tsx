import { useEffect, useState } from "preact/hooks";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import { UserCard } from "../components/UserCard.tsx";
import {
  addUser,
  removeUser,
  setGameStarted,
  setTime,
  state,
} from "../stores/game.ts";

interface LobbyProps {
  url: string;
  anon: string;
  room: string;
}

export default function Lobby({ url, anon, room }: LobbyProps) {
  const [user, _setUser] = useState(crypto.randomUUID());
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    { user: string; message: string; type: "guess" | "winner" }[]
  >([]);
  const { gameStarted, time, users } = state();

  const borderDict = {
    guess: "border-mocha-yellow",
    winner: "border-mocha-green",
  };

  function joinRoom() {
    const supabase = createClient(url, anon);
    const channel = supabase.channel(room);

    const userStatus = {
      user,
      online_at: new Date().toISOString(),
    };

    channel.subscribe(async (status) => {
      if (status !== "SUBSCRIBED") {
        return null;
      }

      await channel.track(userStatus);
    });
  }

  const handleChange = (
    event: preact.JSX.TargetedEvent<HTMLInputElement, Event>,
  ) => {
    setMessage(event.currentTarget.value.trim());
  };

  async function guess() {
    const response = await fetch("/api/guess", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room, message, user }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    setMessage("");
  }

  useEffect(() => {
    joinRoom();

    const client = createClient(url, anon);
    const channel = client.channel(room);

    channel
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("join", key, newPresences);
        if (newPresences[0].user) {
          addUser(newPresences[0].user);
        }
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("leave", key, leftPresences);
        removeUser(leftPresences[0].user);
      })
      .on("broadcast", { event: "start" }, () => {
        console.log("start");
        setGameStarted(true);
      })
      .on("broadcast", { event: "timer" }, ({ payload }) => {
        setTime(payload.time);
        console.log("timer", payload.time);
      })
      .on("broadcast", { event: "guess" }, ({ payload }) => {
        console.log("guess", payload);
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: payload.user, message: payload.message, type: "guess" },
        ]);
      })
      .on("broadcast", { event: "winner" }, ({ payload }) => {
        console.log("winner", payload);
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: payload.user, message: "Indovinato", type: "winner" },
        ]);
      })
      .on("broadcast", { event: "end" }, () => {
        setGameStarted(false);
        console.log("Game stopped");
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div class="size-full">
      {gameStarted
        ? (
          <div class="flex flex-col size-full gap-2">
            <div class="w-full font-bold text-mocha-text bg-mocha-base p-4 rounded focus:outline-none">
              Timer: {time}
            </div>
            <div class="flex size-full flex-col bg-mocha-base p-2 gap-2 overflow-y-auto">
              {messages.map(({ user, message, type }) => (
                <div
                  class={`flex p-4 w-full max-w-full h-fit items-center justify-start border-2 rounded bg-mocha-mantle gap-2
                    ${borderDict[type]}`}
                >
                  <img
                    src={`https://deno-avatar.deno.dev/avatar/${user}.svg`}
                    alt="user avatar"
                    class="size-5 min-w-5 rounded-full"
                  />
                  <p class="leading-relaxed font-semibold text-mocha-text break-all line-clamp-1">
                    {message}
                  </p>
                </div>
              ))}
            </div>
            <input
              class="w-full font-semibold text-mocha-text bg-mocha-base p-4 rounded focus:outline-none"
              placeholder="Guess the word..."
              value={message}
              onInput={handleChange}
              onKeyDown={(event) => {
                if (event.key === "Enter" && message !== "") {
                  guess();
                }
              }}
            />
          </div>
        )
        : (
          <div class="text-mocha-text">
            {users.map((user) => <UserCard user={user} />)}
          </div>
        )}
    </div>
  );
}

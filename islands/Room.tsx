import { useEffect, useState } from "preact/hooks";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";
import { User } from "../components/User.tsx";
import { Message } from "../components/Message.tsx";
import { Loader } from "../components/Loader.tsx";
import Game from "./Game.tsx";
import {
  addUser,
  removeUser,
  setGameStarted,
  setTime,
  state,
} from "../stores/game.ts";

interface RoomProps {
  id: string;
  url: string;
  anon: string;
}

const colors = [
  "#f5c2e7",
  "#cba6f7",
  "#f9e2af",
  "#a6e3a1",
  "#f2cdcd",
  "#74c7ec",
  "#fab387",
  "#eba0ac",
  "#f5e0dc",
  "#b4befe",
  "#89dceb",
  "#94e2d5",
  "#f38ba8",
  "#89b4fa",
];

export default function Room({ id, url, anon }: RoomProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [user, _setUser] = useState({
    id: crypto.randomUUID(),
    username: "Pippo",
    color: colors[Math.floor(Math.random() * colors.length)],
  });
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    {
      user: { id: string; username: string; color: string };
      message: string;
      type: "guess" | "winner";
    }[]
  >([]);
  const [results, setResults] = useState<string[]>([]);
  const { users } = state();

  function joinRoom() {
    const supabase = createClient(url, anon);
    const channel = supabase.channel(id);

    const userStatus = { user, online_at: new Date().toISOString() };

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
      body: JSON.stringify({ room: id, message, user }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    setMessage("");
  }

  async function getScore() {
    const response = await fetch(`/api/rooms/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const { results }: { results: Record<string, number> } = await response
      .json();

    const sortedResults = Object.keys(results).sort((a, b) =>
      results[b] - results[a]
    );
    setResults(sortedResults);
    setGameEnded(true);
  }

  useEffect(() => {
    joinRoom();

    const client = createClient(url, anon);
    const channel = client.channel(id);

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
      .on("broadcast", { event: "loading" }, () => {
        console.log("loading");
        setLoading(true);
      })
      .on("broadcast", { event: "start" }, () => {
        console.log("start");
        setLoading(false);
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
      .on("broadcast", { event: "end" }, async () => {
        console.log("Game stopped");
        await getScore();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div class="flex size-full gap-8 p-8">
      <div class="flex flex-col w-1/5 p-4 rounded bg-mocha-base gap-4 shadow-lg shadow-mocha-base overflow-y-auto">
        {users.map((user) => <User user={user} />)}
      </div>
      {gameEnded
        ? (
          <div class="grid grid-cols-3 grid-rows-3 w-3/5 p-8 rounded bg-mocha-base shadow-lg shadow-mocha-base">
            <span class="row-start-3 col-span-3 bg-mocha-surface0 rounded" />
            <span class="col-start-2 row-start-2 bg-mocha-surface0 rounded-t" />
            <span class="flex col-start-3 row-start-2 items-center justify-center">
              <img
                src={`https://deno-avatar.deno.dev/avatar/${results[2]}.svg`}
                alt="user avatar"
                class="size-20 rounded-full"
              />
            </span>
            <span class="flex col-start-1 row-start-2 items-center justify-center">
              <img
                src={`https://deno-avatar.deno.dev/avatar/${results[1]}.svg`}
                alt="user avatar"
                class="size-20 rounded-full"
              />
            </span>
            <span class="flex col-start-2 row-start-1 items-center justify-center">
              <img
                src={`https://deno-avatar.deno.dev/avatar/${results[0]}.svg`}
                alt="user avatar"
                class="size-20 rounded-full"
              />
            </span>
          </div>
        )
        : (
          <div class="w-3/5 p-8 rounded bg-mocha-base shadow-lg shadow-mocha-base">
            {loading ? <Loader /> : (
              <Game
                room={id}
                host={users.length > 0 && users[0].id === user.id}
              />
            )}
          </div>
        )}
      <div class="w-1/5 p-4 rounded bg-mocha-base shadow-lg shadow-mocha-base">
        <div class="flex flex-col size-full gap-2">
          <div class="flex size-full flex-col bg-mocha-surface0 p-2 gap-0.5 rounded overflow-y-auto">
            {messages.map(({ user, message, type }) => (
              <Message user={user} message={message} type={type} />
            ))}
          </div>
          <input
            class="w-full font-semibold text-mocha-text bg-mocha-surface0 p-4 rounded focus:outline-none"
            placeholder="..."
            value={message}
            onInput={handleChange}
            onKeyDown={(event) => {
              if (event.key === "Enter" && message !== "") {
                guess();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "preact/hooks";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import { User } from "../components/User.tsx";
import { Message } from "../components/Message.tsx";
import { Timer } from "../components/Timer.tsx";
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
  const { users, time } = state();

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
    <div class="flex size-full gap-8 p-8">
      <div class="flex flex-col w-1/5 p-4 rounded bg-mocha-base gap-4 shadow-lg shadow-mocha-base overflow-y-auto">
        {users.map((user) => <User user={user} />)}
      </div>
      <div class="w-3/5 p-8 rounded bg-mocha-base shadow-lg shadow-mocha-base">
        <Timer time={time} />
        <Game room={id} />
      </div>
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

import { useEffect, useState } from "preact/hooks";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";
import { UserCard } from "../components/UserCard.tsx";

interface LobbyProps {
  url: string;
  anon: string;
  room: string;
}

export default function Lobby({ url, anon, room }: LobbyProps) {
  const [user, _setUser] = useState(crypto.randomUUID());
  const [users, setUsers] = useState<string[]>([]);

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

  useEffect(() => {
    joinRoom();

    const client = createClient(url, anon);
    const channel = client.channel(room);

    channel
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("join", key, newPresences);
        setUsers((prevUsers) => [...prevUsers, newPresences[0].user]);
        console.log(users);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("leave", key, leftPresences);
        setUsers((prevUsers) =>
          prevUsers.filter((u) => u !== leftPresences[0].user)
        );
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div class="text-mocha-text">
      {users.length}
      {users.map((user) => <UserCard user={user} />)}
    </div>
  );
}

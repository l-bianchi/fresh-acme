interface UserCardProps {
  user: string;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div class="flex p-4 h-fit border-2 rounded bg-mocha-mantle items-center gap-2 border-mocha-surface1">
      <img
        src={`https://deno-avatar.deno.dev/avatar/${user}.svg`}
        alt="user avatar"
        class="size-10 rounded-full"
      />
      <p class="text-xl font-semibold text-mocha-text">Username</p>
    </div>
  );
}

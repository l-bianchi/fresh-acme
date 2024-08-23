interface UserProps {
  user: { id: string; username: string; color: string };
}

export function User({ user: { id, username, color } }: UserProps) {
  return (
    <div class="flex p-4 border-2 rounded bg-mocha-mantle items-center gap-4 border-mocha-surface1">
      <img
        src={`https://deno-avatar.deno.dev/avatar/${id}.svg`}
        alt="user avatar"
        class="size-10 rounded-full"
      />
      <p
        class={`text-xl font-semibold text-[${color}]`}
        style={{ color }}
      >
        {username}
      </p>
    </div>
  );
}

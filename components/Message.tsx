interface MessageProps {
  user: { id: string; username: string; color: string };
  message: string;
  type: string;
}

export function Message(
  { user: { username, color }, message, type }: MessageProps,
) {
  return (type === "winner"
    ? (
      <div class="flex items-center">
        <span class="text-mocha-green font-semibold break-all line-clamp-1">
          {username} guessed the word!
        </span>
      </div>
    )
    : (
      <div class="flex items-center">
        <span class="font-semibold" style={`color:${color}`}>
          {username}:
        </span>
        <span class="text-mocha-text ml-2 break-all line-clamp-1">
          {message}
        </span>
      </div>
    ));
}

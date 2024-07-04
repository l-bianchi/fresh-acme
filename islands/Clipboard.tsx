import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";

export default function Clipboard() {
  const [room, setRoom] = useState(crypto.randomUUID());
  const [copied, setCopied] = useState(false);

  const generateRoom = () => {
    setRoom(crypto.randomUUID());
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        `https://fresh-acme.deno.dev/${room}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset the "copied" state after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const joinSession = async () => {
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: room }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    window.location.href = `/${room}`;
  };

  return (
    <div class="flex w-full max-w-fit gap-8">
      <div class="flex items-center">
        <button
          class="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-mocha-base bg-mocha-mauve hover:bg-mocha-mauve/80 border border-mocha-mauve hover:border-mocha-mauve/80 rounded-s focus:ring-2 focus:ring-mocha-mauve focus:ring-offset-4 focus:ring-offset-mocha-base transition-colors"
          onClick={generateRoom}
        >
          Generate
        </button>
        <div class="relative w-full">
          <input
            id="url-shortener"
            type="text"
            aria-describedby="helper-text-explanation"
            class="bg-mocha-surface0 border border-e-0 border-mocha-overlay0 text-mocha-subtext0 text-sm border-s-0 block w-full p-2.5"
            value={room}
            readonly
            disabled
          />
        </div>
        <button
          data-tooltip-target="tooltip-url-shortener"
          data-copy-to-clipboard-target="url-shortener"
          class="flex-shrink-0 z-10 inline-flex items-center py-3 px-4 text-sm font-medium text-center text-mocha-mauve bg-mocha-surface0 border border-mocha-overlay0 rounded-e hover:bg-mocha-surface1"
          type="button"
          onClick={copyToClipboard}
        >
          <span class={`${copied ? "hidden" : ""}`}>
            <svg
              class="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 18 20"
            >
              <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
            </svg>
          </span>
          <span class={`${!copied ? "hidden" : ""}`}>
            <svg
              class="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 12"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 5.917 5.724 10.5 15 1.5"
              />
            </svg>
          </span>
        </button>
      </div>
      <Button onClick={joinSession}>
        Join
      </Button>
    </div>
  );
}

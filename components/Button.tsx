import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={!IS_BROWSER || props.disabled}
      class="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-mocha-base bg-mocha-mauve rounded hover:bg-mocha-mauve/80 focus:ring-2 focus:ring-mocha-mauve focus:ring-offset-4 focus:ring-offset-mocha-base transition-colors"
    />
  );
}

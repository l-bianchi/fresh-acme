import {
  makeStore,
  useStore,
} from "https://esm.sh/statery@0.5.4?alias=react:preact/compat&deps=preact@10.19.6";

const gameStore = makeStore<{ gameStarted: boolean }>({
  gameStarted: false,
});

export const setGameStarted = (gameStarted: boolean) =>
  gameStore.set((_state) => ({
    gameStarted: gameStarted,
  }));

export const state = () => useStore(gameStore);

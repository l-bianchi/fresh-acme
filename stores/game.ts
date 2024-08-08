import {
  makeStore,
  useStore,
} from "https://esm.sh/statery@0.5.4?alias=react:preact/compat&deps=preact@10.19.6";

const gameStore = makeStore<
  { users: string[]; gameStarted: boolean; time: number }
>({
  users: [],
  gameStarted: false,
  time: 30,
});

export const addUser = (user: string) =>
  gameStore.set((state) => ({
    users: [...state.users, user],
  }));

export const removeUser = (user: string) =>
  gameStore.set((state) => ({
    users: state.users.filter((u) => u !== user),
  }));

export const setGameStarted = (gameStarted: boolean) =>
  gameStore.set((_state) => ({
    gameStarted: gameStarted,
  }));

export const setTime = (time: number) =>
  gameStore.set((_state) => ({
    time: time,
  }));

export const state = () => useStore(gameStore);

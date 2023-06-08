import { create } from 'zustand';

type SceneUser = {
  id: string;
  username: string;
  cursorPosition: { x: number, y: number };
};

interface SceneState {
  users: Map<string, SceneUser>;
  addUser: (user: SceneUser) => void;
  removeUser: (userId: string) => void;
  getUser: (userId: string) => void;
}

export default create<SceneState>()((set, get) => ({
  users: new Map(),
  addUser: (user: SceneUser) => set((state) => {
    const users = new Map(state.users).set(user.id, user);
    return { ...state, users };
  }),
  removeUser: (userId: string) => set((state) => {
    const users = new Map(state.users);
    users.delete(userId);
    return { ...state, users };
  }),
  getUser: (userId: string) => {
    return get().users.get(userId);
  }
}));

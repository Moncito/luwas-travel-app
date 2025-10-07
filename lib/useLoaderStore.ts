// File: lib/useLoaderStore.ts
'use client';

import { create } from 'zustand';

interface LoaderState {
  isLoading: boolean;
  setLoading: (state: boolean) => void;
}

// ✅ Add explicit type for `set`
export const useLoaderStore = create<LoaderState>()((set) => ({
  isLoading: false,
  setLoading: (state) => set({ isLoading: state }),
}));

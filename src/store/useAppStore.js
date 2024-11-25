// store/useAppStore.js
'use client';

import { create } from 'zustand';

const useAppStore = create((set) => ({
    // App State
    data: null,
    userLocation: null,
    loading: false,
    error: null,
    isModalOpen: false,

    // Actions
    setData: (data) => set({ data }),
    setUserLocation: (location) => set({ userLocation: location }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

    // Reset app state
    resetAppState: () => set({
        data: null,
        error: null,
        loading: false,
        isModalOpen: false
    })
}));

export default useAppStore;
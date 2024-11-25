// store/useFiltersStore.js
'use client';

import { create } from 'zustand';

const TRANSPORT_RADIUS_MAP = {
    "walking": 1000,
    "bicycling": 5000,
    "driving": 25000,
    "transit": 25000,
    "no-limit": 100000
};

const useFiltersStore = create((set) => ({
    // Initial state
    filters: {
        transportMode: "walking",
        radius: TRANSPORT_RADIUS_MAP.walking,
        keywords: [],
        price_range: [1, 1]
    },

    // Actions
    setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
    })),

    updateTransportMode: (mode) => set((state) => ({
        filters: {
            ...state.filters,
            transportMode: mode,
            radius: TRANSPORT_RADIUS_MAP[mode] || TRANSPORT_RADIUS_MAP.walking
        }
    })),

    toggleKeyword: (keyword) => set((state) => {
        const updatedKeywords = state.filters.keywords.includes(keyword)
            ? state.filters.keywords.filter((k) => k !== keyword)
            : [...state.filters.keywords, keyword];

        return {
            filters: {
                ...state.filters,
                keywords: updatedKeywords
            }
        };
    }),

    setPriceRange: (priceRange) => set((state) => ({
        filters: {
            ...state.filters,
            price_range: priceRange
        }
    })),

    resetFilters: () => set({
        filters: {
            transportMode: "walking",
            radius: TRANSPORT_RADIUS_MAP.walking,
            keywords: [],
            price_range: [1, 1]
        }
    })
}));

export default useFiltersStore;
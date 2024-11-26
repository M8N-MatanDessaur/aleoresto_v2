'use client';

import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useFiltersStore from '../store/useFiltersStore';
import useAppStore from '@/store/useAppStore';
import AleorestoMobile from './AleorestoMobile';
import AleorestoDesktop from './AleorestoDesktop';

// Custom hook for media query
const useMediaQuery = (query) => {
  const [matches, setMatches] = React.useState(false);

  useEffect(() => {
    // Avoid running on server side
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      setMatches(media.matches);

      // Update matches when viewport changes
      const listener = () => setMatches(media.matches);
      media.addEventListener('change', listener);

      return () => media.removeEventListener('change', listener);
    }
  }, [query]);

  return matches;
};

const Aleoresto = ({ data, onRandomize, onFilter, setFilters, error }) => {
  const resetFilters = useFiltersStore((state) => state.resetFilters);
  const { userLocation } = useAppStore();
  const isDesktop = useMediaQuery('(min-width: 769px)');

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      resetFilters();
    }
  }, [error, resetFilters]);

  if (!data) {
    return <div>No data available.</div>;
  }

  const props = {
    data,
    onRandomize,
    onFilter,
    setFilters,
    userLocation
  };

  return (
    <>
      {isDesktop ? (
        <AleorestoDesktop {...props} />
      ) : (
        <AleorestoMobile {...props} />
      )}
      <ToastContainer />
    </>
  );
};

export default Aleoresto;
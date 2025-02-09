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

  const LocationServicePrompt = () => {
    return (
      <div className="location-service-prompt">
        <div className="location-service-content">
          <h2>Enable Location Services</h2>
          <p>To find the best restaurants near you, we need access to your location.</p>
          <button 
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    // Force a hard reload to ensure location state is updated
                    window.location.href = window.location.href;
                  },
                  (error) => {
                    toast.error("Please enable location services in your browser settings.");
                  },
                  { enableHighAccuracy: true }
                );
              }
            }}
            className="enable-location-btn"
          >
            Enable Location Services
          </button>
        </div>
        <style jsx>{`
          .location-service-prompt {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: url('https://static.vecteezy.com/system/resources/previews/006/050/745/non_2x/fast-food-doodle-hand-drawn-set-free-vector.jpg');
            background-size: cover;
            background-position: center;
            background-blend-mode: darken;
            background-size: auto;
            background-repeat: no-repeat;
            display: flex;
            justify-content: center;
            align-items: center;
            filter: invert(100%);
          }
          .location-service-prompt::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #ab9324;
            mix-blend-mode: darken;
          }
          .location-service-content {
            position: relative;
            z-index: 1;
            background: #ede8d6;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 90%;
            width: 400px;
          }
          h2 {
            color: #000;
            margin-bottom: 1rem;
            font-size: 1.8rem;
          }
          p {
            color: #000;
            margin-bottom: 2rem;
            line-height: 1.5;
          }
          .enable-location-btn {
            background: #ab9324;
            color: #000;
            border: none;
            padding: 1rem 2rem;
            border-radius: 30px;
            font-size: 1.1rem;
            cursor: pointer;
            transition: transform 0.2s, background 0.2s;
          }
          .enable-location-btn:active {
            transform: scale(1.05);
            outline: none;
            border: none;
          }
            .enable-location-btn:focus {
              outline: none;
              border: none;
            }
        `}</style>
      </div>
    );
  };

  if (!userLocation) {
    return <LocationServicePrompt />;
  }

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
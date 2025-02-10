'use client';

import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useFiltersStore from '../store/useFiltersStore';
import useAppStore from '@/store/useAppStore';
import AleorestoMobile from './AleorestoMobile';
import AleorestoDesktop from './AleorestoDesktop';
import errorBackground from "../app/error-background.png"

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
    const getPlatform = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/android/i.test(userAgent)) return 'android';
      if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
      if (/windows/i.test(userAgent)) return 'windows';
      return 'unknown';
    };

    const handleLocationRequest = () => {
      const platform = getPlatform();
      
      if (!navigator.geolocation) {
        toast.error("Your browser doesn't support location services. Please try a different browser.");
        return;
      }

      const successCallback = (position) => {
        // Store the location in localStorage before reload
        localStorage.setItem('userLocation', JSON.stringify({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }));
        window.location.href = window.location.href;
      };

      const errorCallback = (error) => {
        const platform = getPlatform();
        switch (error.code) {
          case error.PERMISSION_DENIED:
            if (platform === 'android') {
              toast.error("Please enable location in your device settings: Settings > Location");
            } else if (platform === 'ios') {
              toast.error("Please enable location in your device settings: Settings > Privacy > Location Services");
            } else if (platform === 'windows') {
              toast.error("Please enable location services in Windows Settings > Privacy > Location");
            } else {
              toast.error("Please enable location services in your browser settings");
            }
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable. Please try again later.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out. Please check your connection and try again.");
            break;
          default:
            toast.error("An unknown error occurred. Please try again.");
        }
      };

      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };

    return (
      <div className="location-service-prompt">
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <div className="location-service-content">
          <h2>Enable Location Services</h2>
          <p>To find the best restaurants near you, we need access to your location.</p>
          <p className="platform-note">
            {getPlatform() === 'windows' && "On Windows, make sure location services are enabled in Windows Settings."}
            {getPlatform() === 'ios' && "On iOS, you may need to allow location access in your device settings."}
            {getPlatform() === 'android' && "On Android, please ensure location services are enabled in your device settings."}
          </p>
          <button 
            onClick={handleLocationRequest}
            className="enable-location-btn"
          >
            Enable Location Services
          </button>
        </div>
        <style jsx global>{`
          .Toastify__toast {
            background-color: var(--error) !important;
            color: #fff !important;
            box-shadow: none !important;
          }
          .Toastify__close-button {
            color: #fff !important;
          }
          .Toastify__toast-icon {
            color: #fff !important;
          }
          .Toastify__progress-bar {
            background: #fff !important;
          }
        `}</style>
        <style jsx>{`
          .location-service-prompt {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: url(${errorBackground.src});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            mix-blend-mode: exclusion;
          }
          .location-service-prompt::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backdrop-filter: brightness(0.1);
          }
          .location-service-content {
            position: relative;
            z-index: 1;
            background: var(--background);
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 90%;
            width: 400px;
          }
          h2 {
            color: #fff;
            margin-bottom: 1rem;
            font-size: 1.8rem;
          }
          p {
            color: #fff;
            margin-bottom: 2rem;
            line-height: 1.5;
          }
          .platform-note {
            font-size: 1rem;
            margin-bottom: 1rem;
          }
          .enable-location-btn {
            background: var(--primary);
            color: #fff;
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
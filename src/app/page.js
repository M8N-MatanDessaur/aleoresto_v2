'use client';

import React, { useEffect } from 'react';
import AleorestoResult from '../components/Aleoresto.jsx';
import FiltersModal from '../components/FiltersModal/FiltersModal.jsx';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen.jsx';
import useAppStore from '../store/useAppStore';
import useFiltersStore from '../store/useFiltersStore';
import axios from 'axios';

const App = () => {
  // Get state and actions from app store
  const {
    data,
    userLocation,
    loading,
    error,
    isModalOpen,
    setData,
    setUserLocation,
    setLoading,
    setError,
    setIsModalOpen
  } = useAppStore();

  // Get filters from filters store
  const filters = useFiltersStore((state) => state.filters);

  // Fetch user's geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error obtaining location:', error);
          setError('Failed to obtain location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, [setUserLocation, setError]);

  // Fetch randomized data
  const fetchRandomizedData = async () => {
    if (!userLocation) {
      setError('Location is required to fetch data.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/.netlify/functions/random', {
        location: userLocation,
        filters,
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching random data:', error.message);
      setError('Error fetching data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) fetchRandomizedData();
  }, [userLocation]); // Add filters here if you want to refetch when filters change

  return (
    <div>
      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <div>Error: {error}</div>
      ) : data ? (
        <AleorestoResult
          data={data}
          onRandomize={fetchRandomizedData}
          onFilter={() => setIsModalOpen(true)}
        />
      ) : (
        <div>No results found.</div>
      )}

      {isModalOpen && (
        <FiltersModal onRandomize={fetchRandomizedData} closeModal={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default App;
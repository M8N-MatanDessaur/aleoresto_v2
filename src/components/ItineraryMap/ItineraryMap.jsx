import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './ItineraryMap.module.css';
import useFiltersStore from '@/store/useFiltersStore';

if (!mapboxgl.supported()) {
  console.error('Your browser does not support Mapbox GL');
}

mapboxgl.accessToken = 'pk.eyJ1IjoibWF0YW5kZXNzYXVyIiwiYSI6ImNtNnY4bzlpazA1YTEyaXExb2ZjdGF4MzIifQ.W8r_dX4fShCX3YxzrTr04w';

// Custom hook for media query
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      setMatches(media.matches);

      const listener = () => setMatches(media.matches);
      media.addEventListener('change', listener);

      return () => media.removeEventListener('change', listener);
    }
  }, [query]);

  return matches;
};

const ItineraryMap = ({ userLocation, restaurantLocation, restaurantDetails, googleMapsUrl }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [travelInfo, setTravelInfo] = useState({ distance: '', time: '' });
  const filters = useFiltersStore((state) => state.filters);
  const isDesktop = useMediaQuery('(min-width: 769px)');

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-73.5673, 45.5017],
        zoom: 10,
        attributionControl: false,
        preserveDrawingBuffer: true,
        pitch: isDesktop ? 60 : 0, // Increased tilt
        bearing: isDesktop ? -35 : 0 // Same rotation
      });

      map.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
      });

      map.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [isDesktop]); // Re-initialize when screen size changes

  // Update map tilt when screen size changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    map.easeTo({
      pitch: isDesktop ? 60 : 0,
      bearing: isDesktop ? -35 : 0,
      duration: 1000
    });
  }, [isDesktop, mapLoaded]);

  // Handle location updates
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapLoaded || !userLocation?.lat || !restaurantLocation?.lat) {
      return;
    }

    try {
      // Clear existing markers and route
      const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
      existingMarkers.forEach(marker => marker.remove());

      if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route');
      }

      // Remove existing user location circle if it exists
      if (map.getSource('user-location')) {
        map.removeLayer('user-location-outline');
        map.removeLayer('user-location-inner');
        map.removeSource('user-location');
      }

      // Add user location as a circle
      map.addSource('user-location', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [userLocation.lng, userLocation.lat]
          }
        }
      });

      // Add outer circle (blue outline)
      map.addLayer({
        id: 'user-location-outline',
        type: 'circle',
        source: 'user-location',
        paint: {
          'circle-radius': 10,
          'circle-color': '#007bff',
          'circle-opacity': 0.4,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#007bff'
        }
      });

      // Add inner circle (solid blue)
      map.addLayer({
        id: 'user-location-inner',
        type: 'circle',
        source: 'user-location',
        paint: {
          'circle-radius': 5,
          'circle-color': '#007bff',
          'circle-opacity': 1
        }
      });

      // Add restaurant marker (red pin)
      new mapboxgl.Marker({
        color: '#ff4444',
        scale: 1.2 // Slightly larger pin
      })
        .setLngLat([restaurantLocation.lng, restaurantLocation.lat])
        .addTo(map);

      // Fit bounds
      const bounds = new mapboxgl.LngLatBounds()
        .extend([userLocation.lng, userLocation.lat])
        .extend([restaurantLocation.lng, restaurantLocation.lat]);

      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: isDesktop ? 15 : 13,
        duration: 0,
        pitch: isDesktop ? 60 : 40,
        bearing: isDesktop ? -35 : -25
      });

      // Add route
      const getMapboxProfile = (mode) => {
        switch (mode) {
          case 'walking':
            return 'walking';
          case 'bicycling':
            return 'cycling';
          default:
            return 'driving';
        }
      };

      const profile = getMapboxProfile(filters.transportMode);
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${userLocation.lng},${userLocation.lat};${restaurantLocation.lng},${restaurantLocation.lat}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
      console.log(url);
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            // Use the distance and duration from the API response
            const distance = (route.distance / 1000).toFixed(1); // Convert to km
            const duration = Math.round(route.duration / 60); // Convert to minutes
            setTravelInfo({ distance: `${distance} km`, time: `${duration} min`, mode: filters.transportMode });

            // Add the route to the map
            if (map.getSource('route')) {
              map.getSource('route').setData({
                type: 'Feature',
                properties: {},
                geometry: route.geometry
              });
            } else {
              map.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: route.geometry
                }
              });
            }

            map.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#007bff',
                'line-width': 4,
                'line-opacity': 0.75
              }
            });
          }
        })
        .catch(error => {
          console.error('Error fetching route:', error);
        });
    } catch (error) {
      console.error('Error updating map:', error);
    }
  }, [mapLoaded, userLocation, restaurantLocation, isDesktop, filters.transportMode]);

  return (
    <div className={styles.mapContainer}>
      {travelInfo && (
        <div className={styles.travelInfoContainer}>
          <div className={styles.travelInfo}>
            {filters.transportMode === 'walking' ? (
              <svg width="18" height="18" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M15.5 3.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2ZM7 23 9.8 8.9 8 9.6V13H6V8.3l5.05-2.14c.97-.41 2.09-.05 2.65.84l1 1.6C15.5 10 17.1 11 19 11v2c-2.2 0-4.2-1-5.5-2.5l-.6 3 2.1 2V23h-2v-6l-2.1-2-1.8 8H7Z" clipRule="evenodd"></path>
              </svg>
            ) : filters.transportMode === 'bicycling' ? (
              <svg width="18" height="18" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M17.5 3.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2ZM0 17c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5-5-2.2-5-5Zm5 3.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5ZM19.1 11c-2.1 0-3.8-.8-5.1-2.1l-.8-.8-2.4 2.4 2.2 2.3V19h-2v-5l-3.2-2.8c-.4-.3-.6-.8-.6-1.4 0-.5.2-1 .6-1.4l2.8-2.8c.3-.4.8-.6 1.4-.6.6 0 1.1.2 1.6.6l1.9 1.9c.9.9 2.1 1.5 3.6 1.5v2Zm-.1 1c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5Zm-3.5 5c0 1.9 1.6 3.5 3.5 3.5s3.5-1.6 3.5-3.5-1.6-3.5-3.5-3.5-3.5 1.6-3.5 3.5Z" clipRule="evenodd"></path>
              </svg>
            ) : (
              <svg width="18" height="18" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M17.5 4c.66 0 1.22.42 1.42 1.01L21 11v8c0 .55-.45 1-1 1h-1c-.55 0-1-.45-1-1v-1H6v1c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-8l2.08-5.99C5.29 4.42 5.84 4 6.5 4h11ZM5 13.5c0 .83.67 1.5 1.5 1.5S8 14.33 8 13.5 7.33 12 6.5 12 5 12.67 5 13.5ZM17.5 15c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5Zm-11-9.5L5 10h14l-1.5-4.5h-11Z" clipRule="evenodd"></path>
              </svg>
            )}
            <span>{travelInfo.time}</span>
            <span className={styles.dot}>•</span>
            <span>{travelInfo.distance}</span>
          </div>
          {googleMapsUrl && (
            <a href={googleMapsUrl} className={styles.callButton} title="Call Restaurant">
             <svg width="25" height="25" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="m12.71 2.29 9 9c.39.4.39 1.03 0 1.41l-9 9a.996.996 0 0 1-1.41 0l-9-9a.996.996 0 0 1 0-1.41l9-9a.996.996 0 0 1 1.41 0ZM14 12v2.5l3.5-3.5L14 7.5V10H9c-.55 0-1 .45-1 1v4h2v-3h4Z" clipRule="evenodd"></path>
            </svg>
            </a>
          )}
        </div>
      )}
      <div ref={mapContainerRef} className={styles.map} />
    </div>
  );
};

export default ItineraryMap;

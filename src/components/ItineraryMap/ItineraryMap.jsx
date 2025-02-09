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

const ItineraryMap = ({ userLocation, restaurantLocation, restaurantDetails }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [travelInfo, setTravelInfo] = useState({ distance: '', time: '' });
  const filters = useFiltersStore((state) => state.filters);
  const isDesktop = useMediaQuery('(min-width: 769px)');

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    console.log('Restaurant Details:', restaurantDetails);

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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z" fill="currentColor"/>
              <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
            </svg>
            <span>{travelInfo.time}</span>
            <span className={styles.dot}>•</span>
            <span>{travelInfo.distance}</span>
          </div>
          {restaurantDetails?.phoneNumber && (
            <a href={`tel:${restaurantDetails.phoneNumber}`} className={styles.callButton} title="Call Restaurant">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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

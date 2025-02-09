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

const ItineraryMap = ({ userLocation, restaurantLocation }) => {
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
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.lng},${userLocation.lat};${restaurantLocation.lng},${restaurantLocation.lat}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
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
        <div className={styles.travelInfo}>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            {filters.transportMode === 'walking' ? (
              <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"></path>
            ) : filters.transportMode === 'bicycling' ? (
              <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm9.8-8.5h-3.6l3.5-4.5v-2.5h-7v2h4.2l-3.5 4.5v2.5h7z"></path>
            ) : filters.transportMode === 'transit' ? (
              <path d="M4 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v8zm3.5-4.33l1.69 2.26 2.48-3.09L15 14H9l-1.5-2.33zM15 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-9 8c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zm2-8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"></path>
            ) : (
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5z"></path>
            )}
          </svg>
          <span>
            {filters.transportMode === 'transit' ? 'Public Transit' :
             filters.transportMode === 'no-limit' ? 'Driving' :
             filters.transportMode.charAt(0).toUpperCase() + filters.transportMode.slice(1)}
            {' • '}
            {travelInfo.time}
          </span>
          <span className={styles.dot}>•</span>
          <span>{travelInfo.distance}</span>
        </div>
      )}
      <div ref={mapContainerRef} className={styles.map} />
    </div>
  );
};

export default ItineraryMap;

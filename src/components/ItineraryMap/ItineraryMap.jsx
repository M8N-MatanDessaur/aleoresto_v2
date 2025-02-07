import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
        maxZoom: 15,
        duration: 0,
        pitch: isDesktop ? 60 : 0,
        bearing: isDesktop ? -35 : 0
      });

      // Add route
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.lng},${userLocation.lat};${restaurantLocation.lng},${restaurantLocation.lat}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
      
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.routes?.[0]) {
            map.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: data.routes[0].geometry
              }
            });

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
  }, [mapLoaded, userLocation, restaurantLocation, isDesktop]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

export default ItineraryMap;

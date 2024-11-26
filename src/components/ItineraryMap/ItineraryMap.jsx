import React, { useEffect, useRef } from 'react';

const ItineraryMap = ({ userLocation = { lat: 45.6016644, lng: -73.5584176 }, restaurantLocation = { lat: 45.60062019999999, lng: -73.5635113 }, apiKey='AIzaSyD1QD5MMF_sfTYUZZemrJIxGZzcmnYGCOE' }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!userLocation || !restaurantLocation || !apiKey) {
      console.error('Invalid inputs for ItineraryMap');
      return;
    }

    const loadMap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 8,
        disableDefaultUI: true,
        styles: [
          {
            elementType: 'geometry',
            stylers: [{ color: '#212121' }],
          },
          {
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
          {
            elementType: 'labels.text.fill',
            stylers: [{ color: '#757575' }],
          },
          {
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#212121' }],
          },
          {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [{ color: '#757575' }],
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#757575' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#181818' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry.fill',
            stylers: [{ color: '#2c2c2c' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212121' }],
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9e9e9e' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#000000' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#3d3d3d' }],
          },
        ],
      });

      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true, // Removes default markers for customization
      });

      directionsService.route(
        {
          origin: userLocation,
          destination: restaurantLocation,
          travelMode: 'DRIVING',
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);

            const originMarker = new window.google.maps.Marker({
              position: userLocation,
              map: map,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#007bff',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#fff',
              },
            });

            const destinationMarker = new window.google.maps.Marker({
              position: restaurantLocation,
              map: map,
            });
          } else {
            console.error('Directions request failed:', status);
          }
        }
      );
    };

    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = loadMap;
      document.head.appendChild(script);
    } else {
      loadMap();
    }
  }, [userLocation, restaurantLocation, apiKey]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: '10px',
        border: '0',
        outline: 'none',
      }}
    />
  );
};

export default ItineraryMap;

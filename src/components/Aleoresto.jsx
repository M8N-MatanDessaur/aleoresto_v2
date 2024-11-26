'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ItineraryMap from './ItineraryMap/ItineraryMap';
import styles from './AleorestoResult.module.css';

const AleorestoResult = ({ data, onRandomize, onFilter, setFilters }) => {
  if (!data) {
    return <div>No data available.</div>;
  }

  const { name, photos, website, location, address, googleMapsUrl } = data.restaurant;
  const { googleMapsLink } = data.itinerary;


    const handleFilters = () => {
    onFilter();

    setFilters((filters) => ({
        ...filters,
        keywords: [],
    }));
    };

  return (
    <motion.div
      layout
      className={styles.parent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Restaurant Info */}
      <div className={styles.infoSection}>
        <motion.h1 layout="position" className={styles.title}>
          {name}
        </motion.h1>
        <motion.p layout="position" className={styles.address}>
          {address}
        </motion.p>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        {website && (
          <motion.a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.button}
          >
            <svg width="25" height="25" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fillRule="evenodd" d="M5 5v14h14v-7h2v7c0 1.1-.9 2-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7v2H5Zm9 0V3h7v7h-2V6.41l-9.83 9.83-1.41-1.41L17.59 5H14Z" clipRule="evenodd"></path>
</svg>
          </motion.a>
        )}
        <motion.a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.button} ${styles.mapButton}`}
        >
          <svg width="25" height="25" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fillRule="evenodd" d="M20.34 3.03 20.5 3c.28 0 .5.22.5.5v15.12c0 .23-.15.41-.36.48L15 21l-6-2.1-5.34 2.07-.16.03c-.28 0-.5-.22-.5-.5V5.38c0-.23.15-.41.36-.48L9 3l6 2.1 5.34-2.07ZM9 16.78l6 2.11V7.22L9 5.11v11.67Z" clipRule="evenodd"></path>
</svg>
        </motion.a>
      </div>

            {/* Images Carousel */}
            <div className={styles.carouselSection}>
        {photos && photos.length > 0 ? (
          <div className={styles.carousel}>
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Photo ${index + 1}`}
                className={styles.carouselImage}
              />
            ))}
          </div>
        ) : (
          <div className={styles.noImages}>No images available</div>
        )}
      </div>

      {/* Map Section */}
      <div className={styles.mapSection}>
        <ItineraryMap 
          userLocation={{ lat: 45.6016644, lng: -73.5584176 }} 
          restaurantLocation={location} 
        />
      </div>



      {/* Control Buttons */}
      <button onClick={handleFilters} className={styles.filterButton}>
      <svg width="25" height="25" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 18h4v-2h-4v2ZM3 6v2h18V6H3Zm3 7h12v-2H6v2Z"></path>
</svg>
      </button>
      <button onClick={onRandomize} className={styles.randomizeButton}>
      <svg width="25" height="25" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41ZM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5Zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13Z"></path>
</svg>
      </button>
    </motion.div>
  );
};

export default AleorestoResult;
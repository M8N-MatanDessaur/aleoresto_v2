'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ItineraryMap from './ItineraryMap/ItineraryMap';
import styles from './AleorestoDesktop.module.css';
import useFiltersStore from '../store/useFiltersStore';
import useAppStore from '@/store/useAppStore';

const AleorestoDesktop = ({ data, onRandomize, onFilter, setFilters, error }) => {
  const resetFilters = useFiltersStore((state) => state.resetFilters);
  const {userLocation, restaurantLocation} = useAppStore();
  const carouselRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const newScrollPosition = carouselRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      carouselRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  if (!data) {
    return <div>No data available.</div>;
  }

  const { name, photos, website, location, address, googleMapsUrl } = data.restaurant;

  const handleFilters = () => {
    onFilter();
    setFilters((filters) => ({
      ...filters,
      keywords: [],
    }));
  };

  return (
    <div className={styles.container}>
      {/* Full-screen map */}
      <div className={styles.mapSection}>
        <ItineraryMap
          userLocation={userLocation}
          restaurantLocation={location}
        />
      </div>

      {/* Floating info section */}
      <motion.div
        layout
        className={styles.infoSection}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h1 layout="position" className={styles.title}>
          {name}
        </motion.h1>
        <motion.p layout="position" className={styles.address}>
          {address}
        </motion.p>
      </motion.div>

      {/* Floating carousel */}
      <div className={styles.carouselSection}>
        {photos && photos.length > 0 ? (
          <div className={styles.carouselContainer}>
            <button 
              className={`${styles.carouselButton} ${styles.carouselButtonLeft}`}
              onClick={() => scrollCarousel('left')}
              aria-label="Previous image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={styles.carousel} ref={carouselRef}>
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className={styles.carouselImage}
                />
              ))}
            </div>
            <button 
              className={`${styles.carouselButton} ${styles.carouselButtonRight}`}
              onClick={() => scrollCarousel('right')}
              aria-label="Next image"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className={styles.noImages}>No images available</div>
        )}
      </div>

      {/* Floating action buttons */}
      <div className={styles.actionButtons}>
        <button onClick={handleFilters} className={styles.filterButton}>
          <svg width="25" height="25" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 18h4v-2h-4v2ZM3 6v2h18V6H3Zm3 7h12v-2H6v2Z"></path>
          </svg>
        </button>
        {website && (website.includes('https://') || website.includes('www.')) && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.button}
          >
            <svg width="25" height="25" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5v14h14v-7h2v7c0 1.1-.9 2-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7v2H5Zm9 0V3h7v7h-2V6.41l-9.83 9.83-1.41-1.41L17.59 5H14Z"></path>
            </svg>
          </a>
        )}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.button}
        >
          <svg width="25" height="25" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.34 3.03 20.5 3c.28 0 .5.22.5.5v15.12c0 .23-.15.41-.36.48L15 21l-6-2.1-5.34 2.07-.16.03c-.28 0-.5-.22-.5-.5V5.38c0-.23.15-.41.36-.48L9 3l6 2.1 5.34-2.07Z"></path>
          </svg>
        </a>
        <button onClick={onRandomize} className={styles.randomizeButton}>
          <svg width="30" height="30" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41ZM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5Zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13Z"></path>
          </svg>
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AleorestoDesktop;
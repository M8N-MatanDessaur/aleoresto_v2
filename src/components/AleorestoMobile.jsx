'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ItineraryMap from './ItineraryMap/ItineraryMap';
import styles from './AleorestoMobile.module.css';
import useFiltersStore from '../store/useFiltersStore';
import useAppStore from '@/store/useAppStore';

const AleorestoMobile = ({ data, onRandomize, onFilter, setFilters, error }) => {
  const resetFilters = useFiltersStore((state) => state.resetFilters);
  const { userLocation, restaurantLocation } = useAppStore();
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
  }, [error]);

  if (!data) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.loadingSpinner}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <p>Finding your next favorite restaurant...</p>
      </div>
    );
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
    <>
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
          {website && (website.includes('https://') || website.includes('www.')) && (
            <motion.a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.button}
            >
              <svg width="25" height="25" fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.25A9.75 9.75 0 0 0 2.25 12c0 5.384 4.365 9.75 9.75 9.75 5.384 0 9.75-4.366 9.75-9.75 0-5.385-4.366-9.75-9.75-9.75Z"></path>
                <path d="M12 2.25c-2.722 0-5.28 4.365-5.28 9.75 0 5.384 2.56 9.75 5.281 9.75 2.722 0 5.282-4.366 5.282-9.75 0-5.385-2.56-9.75-5.282-9.75Z"></path>
                <path d="M5.5 5.5C7.293 6.773 9.55 7.532 12 7.532c2.451 0 4.708-.76 6.5-2.032"></path>
                <path d="M18.5 18.5c-1.792-1.272-4.049-2.031-6.5-2.031-2.45 0-4.707.759-6.5 2.031"></path>
                <path d="M12 2.25v19.5"></path>
                <path d="M21.75 12H2.25"></path>
              </svg>
            </motion.a>
          )}
           {data.restaurant?.phoneNumber && (
          <motion.a
            href={`tel:${data.restaurant?.phoneNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.button} ${styles.mapButton}`}
          >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
          </motion.a>
           )}
        </div>

        {/* Images Carousel */}
        <div className={styles.carouselSection}>
          {photos && photos.length > 0 ? (
            <div className={styles.carouselContainer}>
              <button
                className={`${styles.carouselButton} ${styles.carouselButtonLeft}`}
                onClick={() => scrollCarousel('left')}
                aria-label="Previous image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                  <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ) : (
            <div className={styles.noImages}>No images available</div>
          )}
        </div>

        {/* Map Section */}
        <div className={styles.mapSection}>
          <ItineraryMap
            userLocation={userLocation}
            restaurantLocation={location}
            restaurantDetails={data.restaurant}
            googleMapsUrl={googleMapsUrl}
          />
        </div>

        {/* Control Buttons */}
        <button onClick={handleFilters} className={styles.filterButton}>
          <svg
            width="25"
            height="25"
            fill="#ffffff"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 18h4v-2h-4v2ZM3 6v2h18V6H3Zm3 7h12v-2H6v2Z"></path>
          </svg>
        </button>
        <button onClick={onRandomize} className={styles.randomizeButton}>
          <svg
            width="25"
            height="25"
            fill="#ffffff"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41ZM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5Zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13Z"></path>
          </svg>
        </button>
      </motion.div>

      {/* Toast Notification Container */}
      <ToastContainer />
    </>
  );
};

export default AleorestoMobile;

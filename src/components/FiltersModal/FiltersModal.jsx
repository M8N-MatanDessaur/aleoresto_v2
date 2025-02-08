// components/FiltersModal/FiltersModal.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useFiltersStore from '../../store/useFiltersStore';
import styles from './FiltersModal.module.css';

const predefinedKeywords = {
    "Popular": [
        "pizza",
        "burgers",
        "sushi",
        "tacos",
        "sandwiches",
        "coffee",
        "ice cream",
        "bar",
        "bakery"
    ],
    "Cuisines": [
        "italian restaurant",
        "japanese restaurant",
        "mexican restaurant",
        "indian restaurant",
        "chinese restaurant",
        "thai restaurant",
        "vietnamese restaurant",
        "korean restaurant",
        "french restaurant",
        "greek restaurant",
        "spanish restaurant"
    ],
    "Dietary": [
        "vegan restaurant",
        "vegetarian restaurant",
        "gluten free restaurant",
        "halal restaurant"
    ],
    "Meal Type": [
        "breakfast",
        "brunch",
        "lunch",
        "dinner"
    ],
    "Features": [
        "outdoor seating",
        "delivery",
        "takeout",
        "wifi",
        "bar",
        "cafe",
        "fast food",
        "family restaurant",
        "fine dining"
    ]
};


const FiltersModal = ({ closeModal, onRandomize }) => {
    const [customKeyword, setCustomKeyword] = useState("");
    const [activeCategory, setActiveCategory] = useState("Popular");
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
    const categoryTabsRef = useRef(null);

    const scrollTabs = (direction) => {
        if (categoryTabsRef.current) {
            const scrollAmount = 200;
            const newScrollPosition = categoryTabsRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
            categoryTabsRef.current.scrollTo({
                left: newScrollPosition,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth > 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filters = useFiltersStore((state) => state.filters);
    const { updateTransportMode, toggleKeyword, setPriceRange, resetFilters } = useFiltersStore();

    const handleReset = () => {
        resetFilters();
        setCustomKeyword("");
        setActiveCategory("Popular");
    };
    
    const handleApply = () => {
        onRandomize();
        closeModal();
    };

    const addCustomKeyword = () => {
        if (customKeyword.trim() && !filters.keywords.includes(customKeyword)) {
            toggleKeyword(customKeyword.trim());
        }
        setCustomKeyword("");
    };

    return (
        <>
            <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ 
                    duration: 0.3,
                }}
                onClick={closeModal}
            />
            <motion.div
                className={styles.modal}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ 
                    duration: 0.2,
                    ease: [0.16, 1, 0.3, 1]
                }}
            >
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <h2>Filters</h2>
                        <button onClick={closeModal} className={styles.closeIcon}>×</button>
                    </div>

                    {/* Selected Keywords */}
                    {filters.keywords.length > 0 && (
                        <div className={styles.selectedKeywords}>
                                            <button 
                            onClick={handleReset} 
                            className={styles.resetButton}
                            disabled={!filters.keywords.length && filters.transportMode === "walking" && filters.price_range[1] === 1}
                        >
                            <svg width="25" height="25" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="m14.5 3 1 1H19v2H5V4h3.5l1-1h5ZM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12Zm6-9 4 4h-2v4h-4v-4H8l4-4Z" clip-rule="evenodd"></path>
</svg>
                        </button>
                        {filters.keywords.map((keyword) => (
                            <div
                                key={keyword}
                                className={styles.selectedPill}
                                onClick={() => toggleKeyword(keyword)}
                            >
                                {keyword}
                                <span className={styles.removeIcon}>×</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Search Input */}
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Add custom filter keyword..."
                        value={customKeyword}
                        onChange={(e) => setCustomKeyword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                addCustomKeyword();
                            }
                        }}
                        className={styles.searchInput}
                    />
                    <button 
                        className={styles.addButton}
                        onClick={addCustomKeyword}
                        disabled={!customKeyword.trim()}
                        aria-label="Add keyword"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>

                {/* Category Tabs */}
                <label className={styles.label}>Filters Groups</label>
                <div className={styles.categoryTabsContainer}>
                    <button 
                        className={styles.navigationButton} 
                        onClick={() => scrollTabs('left')}
                        aria-label="Scroll left"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <div className={styles.categoryTabs} ref={categoryTabsRef}>
                        {Object.keys(predefinedKeywords).map((category) => (
                            <button
                                key={category}
                                className={`${styles.categoryTab} ${
                                    activeCategory === category ? styles.activeTab : ""
                                }`}
                                onClick={() => setActiveCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <button 
                        className={styles.navigationButton} 
                        onClick={() => scrollTabs('right')}
                        aria-label="Scroll right"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>

                {/* Keywords Grid */}
                <div className={styles.keywordsGrid}>
                    {predefinedKeywords[activeCategory].map((keyword) => (
                        <div
                            key={keyword}
                            onClick={() => toggleKeyword(keyword)}
                            className={`${styles.keywordPill} ${
                                filters.keywords.includes(keyword) ? styles.activePill : ''
                            }`}
                        >
                            {keyword}
                        </div>
                    ))}
                </div>

                {/* Settings */}
                <div className={styles.settingsSection}>
                    <div className={styles.settingItem}>
                        <label>Travel Mode</label>
                        <select
                            value={filters.transportMode}
                            onChange={(e) => updateTransportMode(e.target.value)}
                            className={styles.select}
                        >
                            <option value="walking">Walking distance (up to 2 km)</option>
                            <option value="bicycling">Biking distance (up to 5 km)</option>
                            <option value="driving">Driving distance (up to 10 km)</option>
                            <option value="transit">Public transit (up to 10 km)</option>
                            <option value="no-limit">Any distance</option>
                        </select>
                    </div>

                    <div className={styles.settingItem}>
                        <label>Price Range</label>
                        <div className={styles.priceButtons}>
                            {["$", "$$", "$$$", "$$$$"].map((price, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPriceRange([1, index + 1])}
                                    className={`${styles.priceButton} ${
                                        filters.price_range[1] >= index + 1 ? styles.activePriceButton : ''
                                    }`}
                                >
                                    {price}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                    <button onClick={closeModal} className={styles.cancelButton}>
                        Cancel
                    </button>
                    <button onClick={handleApply} className={styles.applyButton}>
                        Apply Filters
                    </button>
                </div>
            </div>
        </motion.div>
        </>
    );
};

export default FiltersModal;
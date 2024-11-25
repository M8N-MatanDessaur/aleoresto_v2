// components/FiltersModal/FiltersModal.jsx
'use client';

import React, { useState } from 'react';
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
        <motion.div
            className={styles.modal}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
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
                            <svg width="20" height="20" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

                {/* Search Bar */}
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        value={customKeyword}
                        onChange={(e) => setCustomKeyword(e.target.value)}
                        placeholder="Search or add custom keyword"
                        className={styles.searchInput}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomKeyword()}
                    />
                </div>

                {/* Category Tabs */}
                <div className={styles.categoryTabs}>
                    {Object.keys(predefinedKeywords).map((category) => (
                        <button
                            key={category}
                            className={`${styles.categoryTab} ${activeCategory === category ? styles.activeTab : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
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
                            <option value="walking">Walking</option>
                            <option value="driving">Driving</option>
                            <option value="bicycling">Bicycling</option>
                            <option value="transit">Transit</option>
                            <option value="no-limit">No Limit</option>
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
    );
};

export default FiltersModal;
'use client';

import React from "react";
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ loading=true }) {
    return (
        <div className={`${styles.loadingOverlay} ${loading ? styles.show : ''}`}>
            ALÉ&nbsp;<div className={styles.loadingSpinner} />&nbsp;RESTO
        </div>
    );
}
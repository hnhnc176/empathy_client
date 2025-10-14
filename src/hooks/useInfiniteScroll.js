import React, { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for infinite scrolling functionality
 * @param {Function} fetchMore - Function to fetch more data
 * @param {boolean} hasMore - Whether there are more items to load
 * @param {boolean} loading - Whether data is currently being loaded
 * @param {number} threshold - Distance from bottom to trigger load (pixels)
 * @returns {Object} - Object containing loading state and scroll handler
 */
export const useInfiniteScroll = (fetchMore, hasMore, loading, threshold = 100) => {
    // Safety check for React hooks availability
    if (!React || !useState || !useEffect || !useCallback) {
        console.warn('React hooks not available in useInfiniteScroll, returning fallback');
        return {
            isFetching: false,
            setIsFetching: () => {}
        };
    }

    // Guard clauses for required parameters
    if (typeof fetchMore !== 'function') {
        console.warn('fetchMore must be a function in useInfiniteScroll');
        return {
            isFetching: false,
            setIsFetching: () => {}
        };
    }

    const [isFetching, setIsFetching] = useState(false);

    // Handle scroll event
    const handleScroll = useCallback(() => {
        // Skip if already fetching, no more data, or currently loading
        if (isFetching || !hasMore || loading) return;

        // Check if user has scrolled near bottom
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight || window.innerHeight;

        if (scrollTop + clientHeight >= scrollHeight - threshold) {
            setIsFetching(true);
        }
    }, [isFetching, hasMore, loading, threshold]);

    // Attach/detach scroll listener
    useEffect(() => {
        if (!hasMore) return;

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll, hasMore]);

    // Fetch more data when isFetching is true
    useEffect(() => {
        if (!isFetching) return;

        const fetchData = async () => {
            try {
                await fetchMore();
            } catch (error) {
                console.error('Error fetching more data:', error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchData();
    }, [isFetching, fetchMore]);

    return {
        isFetching,
        setIsFetching
    };
};

export default useInfiniteScroll;
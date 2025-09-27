"use client";

import { useState, useEffect, useRef } from 'react';

interface PhotoGalleryProps {
  images?: string[];
}

const PhotoGallery = ({ images = [] }: PhotoGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Case study images for hero carousel
  const defaultImages = [
    '/assets/hero-carousell-image/Case study 1.jpg',
    '/assets/hero-carousell-image/Case study 2.jpg',
    '/assets/hero-carousell-image/Case study 3.jpg',
    '/assets/hero-carousell-image/Case study 4.jpg',
  ];

  const galleryImages = images.length > 0 ? images : defaultImages;

  // Get position for continuous scrolling effect
  const getImageStyle = (index: number) => {
    // Calculate position relative to current index
    let position = index - currentIndex;
    
    // Handle wrapping for infinite loop
    const totalImages = galleryImages.length;
    if (position > totalImages / 2) {
      position = position - totalImages;
    } else if (position < -totalImages / 2) {
      position = position + totalImages;
    }

    // Calculate transform based on position
    const translateX = position * 60; // Decreased spacing between images
    const scale = position === 0 ? 1 : 0.5;
    const opacity = Math.abs(position) <= 1 ? 1 : 0;
    const zIndex = position === 0 ? 20 : 10 - Math.abs(position);
    
    const width = 1200; // Change this value to adjust center image size
    const height = 680; // Change this value to adjust center image height

    return {
      transform: `translateX(${translateX}%) scale(${scale})`,
      opacity: opacity,
      zIndex: zIndex,
      transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      position: 'absolute' as const,
      left: '50%',
      top: '50%',
      width: `${width}px`,
      maxWidth: '80vw',
      height: `${height}px`,
      transformOrigin: 'center',
      marginLeft: `-${width / 2}px`,
      marginTop: `-${height / 2}px`,
      cursor: position !== 0 ? 'pointer' : 'default',
      pointerEvents: Math.abs(position) > 1 ? ('none' as const) : ('auto' as const)
    };
  };

  // Navigation function
  const navigate = (direction: 'next' | 'prev') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (direction === 'next') {
      setCurrentIndex(prev => (prev + 1) % galleryImages.length);
    } else if (direction === 'prev') {
      setCurrentIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length);
    }

    setTimeout(() => setIsAnimating(false), 600);
  };

  // Handle image click for navigation
  const handleImageClick = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    
    // Determine shortest path to clicked image
    const forward = (index - currentIndex + galleryImages.length) % galleryImages.length;
    const backward = (currentIndex - index + galleryImages.length) % galleryImages.length;
    
    if (forward <= backward && forward === 1) {
      navigate('next');
    } else if (backward < forward && backward === 1) {
      navigate('prev');
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        navigate('next');
      } else {
        navigate('prev');
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };


  // Auto-play functionality (removed unused setIsAutoPlaying)
  const [isAutoPlaying] = useState(false);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      navigate('next');
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentIndex]);

  if (galleryImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No images to display</p>
      </div>
    );
  }

  return (
    <div className="w-ful">
      {/* Main carousel container */}
      <div 
        className="relative h-[505px] md:h-[700px] lg:h-[800px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Images container */}
        <div className="relative w-full h-full">
          {galleryImages.map((image, index) => {
            const style = getImageStyle(index);
            const isCenter = index === currentIndex;
            
            return (
              <div
                key={index}
                style={style}
                onClick={() => handleImageClick(index)}
              >
                <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-contain bg-white"
                  />
                  
                  {/* Subtle overlay for non-center images */}
                  {!isCenter && (
                    <div className="absolute inset-0 bg-black/10 transition-opacity duration-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Smooth navigation buttons */}
        <button
          onClick={() => navigate('prev')}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-700 rounded-full p-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
          aria-label="Previous image"
          disabled={isAnimating}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={() => navigate('next')}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white text-gray-700 rounded-full p-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
          aria-label="Next image"
          disabled={isAnimating}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Image indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {galleryImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setCurrentIndex(index);
              }
            }}
            className={`
              transition-all duration-500 rounded-full
              ${index === currentIndex
                ? 'bg-red-500 w-8 h-2'
                : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
              }
            `}
            aria-label={`Go to image ${index + 1}`}
            disabled={isAnimating}
          />
        ))}
      </div>

      {/* Image counter */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-600 font-medium">
          {currentIndex + 1} / {galleryImages.length}
        </span>
      </div>
    </div>
  );
};

export default PhotoGallery;
"use client";

import { useState, useEffect, useRef } from 'react';

interface GalleryItem {
  src: string;
  title?: string;
  description?: string;
}

interface PhotoGalleryProps {
  images?: (string | GalleryItem)[];
}

const PhotoGallery = ({ images = [] }: PhotoGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Case study images for hero carousel
  const defaultImages: GalleryItem[] = [
    {
      src: '/assets/hero-carousell-image/Case study 1.jpg',
      title: 'SIT Campus',
      description: 'An upward view of SIT’s distinctive red skybridge and contemporary buildings, showcasing the university’s modern industrial-inspired design.'
    },
    {
      src: '/assets/hero-carousell-image/Case study 2.jpg',
      title: 'SIT CCA Fair',
      description: 'A vibrant and crowded fair where students interact with club representatives, explore interest groups, and find communities to join as part of campus life.'
    },
    {
      src: '/assets/hero-carousell-image/Case study 3.png',
      title: 'SIT Helix',
      description: 'Forge a strong community by engaging in interactive activities and meaningful programmes with your peers.'
    },
    {
      src: '/assets/hero-carousell-image/Case study 4.jpg',
      title: 'Student Community Gathering',
      description: 'An open-space event where students gather to connect with clubs, enjoy performances, and participate in light activities.'
    },
  ];

  // Normalize input images to GalleryItem[]
  const galleryImages: GalleryItem[] = (images.length > 0 ? images : defaultImages).map(img =>
    typeof img === 'string' ? { src: img } : img
  );

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

    const width = 960; // Change this value to adjust center image size
    const height = 544; // Change this value to adjust center image height

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
        className="relative h-[505px] md:h-[200px] lg:h-[650px] overflow-hidden"
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
                className="group"
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={image.src}
                    alt={image.title || `Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Text Overlay - Only visible on center image */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                    flex flex-col justify-end p-8 md:p-12
                    transition-opacity duration-500
                    ${isCenter ? 'opacity-100' : 'opacity-0'}
                  `}>
                    <div className={`
                      transform transition-all duration-700 delay-100
                      ${isCenter ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                    `}>
                      {image.title && (
                        <h3 className="text-white text-2xl md:text-4xl font-bold mb-3 tracking-tight drop-shadow-lg">
                          {image.title}
                        </h3>
                      )}
                      {image.description && (
                        <p className="text-gray-200 text-sm md:text-lg max-w-2xl font-medium leading-relaxed drop-shadow-md">
                          {image.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dark overlay for non-center images */}
                  {!isCenter && (
                    <div className="absolute inset-0 bg-black/40 transition-opacity duration-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Smooth navigation buttons */}
        <button
          onClick={() => navigate('prev')}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 border border-white/20"
          aria-label="Previous image"
          disabled={isAnimating}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => navigate('next')}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 border border-white/20"
          aria-label="Next image"
          disabled={isAnimating}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Image indicators */}
      <div className="flex justify-center mt-8 space-x-3">
        {galleryImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setCurrentIndex(index);
              }
            }}
            className={`
              transition-all duration-500 rounded-full h-2
              ${index === currentIndex
                ? 'bg-[#F44336] w-8'
                : 'bg-gray-300 hover:bg-gray-400 w-2'
              }
            `}
            aria-label={`Go to image ${index + 1}`}
            disabled={isAnimating}
          />
        ))}
      </div>

      {/* Image counter */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-500 font-medium tracking-widest">
          {String(currentIndex + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default PhotoGallery;
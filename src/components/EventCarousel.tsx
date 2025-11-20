"use client";

import { useState } from "react";
import ServiceCard from "./ServiceCard";

interface Event {
  title: string;
  description: string;
  image?: string;
}

interface EventCarouselProps {
  events: Event[];
}

const EventCarousel = ({ events }: EventCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, events.length - itemsPerView.desktop);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, events.length - itemsPerView.desktop);
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Calculate number of dots based on desktop view (3 items per view)
  const totalDots = Math.max(1, events.length - itemsPerView.desktop + 1);

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView.desktop)}%)`,
          }}
        >
          {events.map((event, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4"
            >
              <ServiceCard
                title={event.title}
                description={event.description}
                image={event.image}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {events.length > itemsPerView.desktop && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-all z-10"
            aria-label="Previous event"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-all z-10"
            aria-label="Next event"
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {events.length > itemsPerView.desktop && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalDots }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentIndex === index
                  ? "bg-[#F44336] w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventCarousel;

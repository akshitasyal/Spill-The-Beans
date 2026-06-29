import React, { useState, TouchEvent } from 'react';
import './ProductGallery.css';

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const imagesToDisplay = images.length > 0 ? images : ['/placeholder.png'];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;

    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${imagesToDisplay[activeIndex]})`,
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  // Mobile Swipe Support
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;

    // Swipe threshold 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeIndex < imagesToDisplay.length - 1) {
        // Swipe left -> Next
        setActiveIndex((prev) => prev + 1);
      } else if (diff < 0 && activeIndex > 0) {
        // Swipe right -> Prev
        setActiveIndex((prev) => prev - 1);
      }
      setTouchStart(null);
    }
  };

  return (
    <div className="product-gallery">
      {/* Main image viewport */}
      <div 
        className="product-gallery__main-wrap"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <img
          src={imagesToDisplay[activeIndex]}
          alt={`Product main display ${activeIndex + 1}`}
          className="product-gallery__main-img"
        />
        {/* Zoom Window Overlay (Destructive mouse-over zoom lens) */}
        <div className="product-gallery__zoom" style={zoomStyle} />
      </div>

      {/* Thumbnails row */}
      {imagesToDisplay.length > 1 && (
        <div className="product-gallery__thumbs">
          {imagesToDisplay.map((img, index) => (
            <button
              key={index}
              className={`product-gallery__thumb-btn ${activeIndex === index ? 'product-gallery__thumb-btn--active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}`}
            >
              <img
                src={img}
                alt={`Product thumbnail ${index + 1}`}
                className="product-gallery__thumb-img"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

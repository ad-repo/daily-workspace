import { useEffect, useState } from 'react';
import { useHoliday } from '../contexts/HolidayContext';

const HolidayBackground = () => {
  const { enabled, backgroundImage } = useHoliday();
  const [opacity, setOpacity] = useState(0);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !backgroundImage) {
      // Fade out
      setOpacity(0);
      // Clear image after fade completes
      const timeout = setTimeout(() => {
        setCurrentImage(null);
      }, 500);
      return () => clearTimeout(timeout);
    }

    // New image - fade in
    setCurrentImage(backgroundImage);
    // Small delay to ensure image loads before fading in
    const timeout = setTimeout(() => {
      setOpacity(1);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [enabled, backgroundImage]);

  if (!enabled || !currentImage) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        backgroundImage: `url(${currentImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: opacity * 0.2, // Low opacity for readability (20%)
        transition: 'opacity 0.5s ease-in-out',
      }}
      aria-hidden="true"
    />
  );
};

export default HolidayBackground;


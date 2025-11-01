import { useEffect, useState } from 'react';
import { useHoliday } from '../contexts/HolidayContext';

const HolidayBackground = () => {
  const { enabled, backgroundImage } = useHoliday();
  const [opacity, setOpacity] = useState(0);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  console.log('[HolidayBackground] Render:', { enabled, backgroundImage, opacity, currentImage });

  useEffect(() => {
    console.log('[HolidayBackground] useEffect triggered:', { enabled, backgroundImage });
    if (!enabled || !backgroundImage) {
      console.log('[HolidayBackground] Fading out...');
      // Fade out
      setOpacity(0);
      // Clear image after fade completes
      const timeout = setTimeout(() => {
        console.log('[HolidayBackground] Clearing image');
        setCurrentImage(null);
      }, 500);
      return () => clearTimeout(timeout);
    }

    // New image - fade in
    console.log('[HolidayBackground] Setting new image:', backgroundImage);
    setCurrentImage(backgroundImage);
    // Small delay to ensure image loads before fading in
    const timeout = setTimeout(() => {
      console.log('[HolidayBackground] Fading in...');
      setOpacity(1);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [enabled, backgroundImage]);

  if (!enabled || !currentImage) {
    console.log('[HolidayBackground] Not rendering (disabled or no image)');
    return null;
  }

  console.log('[HolidayBackground] Rendering background with image:', currentImage);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        backgroundImage: `url(${currentImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: opacity * 0.2, // Low opacity for readability (20%)
        transition: 'opacity 0.5s ease-in-out',
        pointerEvents: 'none', // Allow clicks to pass through
      }}
      aria-hidden="true"
    />
  );
};

export default HolidayBackground;


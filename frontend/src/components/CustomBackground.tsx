import { useEffect, useState } from 'react';
import { useCustomBackground } from '../contexts/CustomBackgroundContext';

const CustomBackground = () => {
  const { enabled, currentImage } = useCustomBackground();
  const [opacity, setOpacity] = useState(0);
  const [displayImage, setDisplayImage] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !currentImage) {
      // Fade out
      setOpacity(0);
      // Clear image after fade completes
      const timeout = setTimeout(() => {
        setDisplayImage(null);
      }, 500);
      return () => clearTimeout(timeout);
    }

    // New image - fade in
    setDisplayImage(currentImage);
    // Small delay to ensure image loads before fading in
    const timeout = setTimeout(() => {
      setOpacity(1);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [enabled, currentImage]);

  if (!enabled || !displayImage) {
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
        zIndex: 0,
        backgroundImage: `url(${displayImage})`,
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

export default CustomBackground;


import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UploadedImage {
  id: string;
  filename: string;
  original_filename: string;
  url: string;
  content_type: string;
  size: number;
}

interface CustomBackgroundContextType {
  enabled: boolean;
  toggleEnabled: () => void;
  currentImage: string | null;
  uploadedImages: UploadedImage[];
  fetchUploadedImages: () => Promise<void>;
  nextImage: () => void;
  autoRotate: boolean;
  toggleAutoRotate: () => void;
  rotationInterval: number; // in minutes
  setRotationInterval: (minutes: number) => void;
}

const CustomBackgroundContext = createContext<CustomBackgroundContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ENABLED: 'custom_background_enabled',
  CURRENT_INDEX: 'custom_background_current_index',
  AUTO_ROTATE: 'custom_background_auto_rotate',
  ROTATION_INTERVAL: 'custom_background_rotation_interval',
};

export const CustomBackgroundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ENABLED);
    return stored ? JSON.parse(stored) : false;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_INDEX);
    return stored ? parseInt(stored, 10) : 0;
  });

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const [autoRotate, setAutoRotate] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTO_ROTATE);
    return stored ? JSON.parse(stored) : true;
  });

  const [rotationInterval, setRotationIntervalState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ROTATION_INTERVAL);
    return stored ? parseInt(stored, 10) : 60; // Default 60 minutes
  });

  // Fetch uploaded images from backend
  const fetchUploadedImages = async (): Promise<void> => {
    try {
      const response = await axios.get(`${API_URL}/api/background-images/list`);
      setUploadedImages(response.data || []);
    } catch (error) {
      console.error('[CustomBackground] Failed to fetch uploaded images:', error);
      setUploadedImages([]);
    }
  };

  // Get current image URL
  const currentImage = uploadedImages.length > 0 && enabled
    ? `${API_URL}${uploadedImages[currentIndex % uploadedImages.length].url}`
    : null;

  // Toggle enabled state
  const toggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    localStorage.setItem(STORAGE_KEYS.ENABLED, JSON.stringify(newEnabled));
  };

  // Move to next image
  const nextImage = () => {
    if (uploadedImages.length === 0) return;
    
    const newIndex = (currentIndex + 1) % uploadedImages.length;
    setCurrentIndex(newIndex);
    localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, newIndex.toString());
  };

  // Toggle auto-rotation
  const toggleAutoRotate = () => {
    const newAutoRotate = !autoRotate;
    setAutoRotate(newAutoRotate);
    localStorage.setItem(STORAGE_KEYS.AUTO_ROTATE, JSON.stringify(newAutoRotate));
  };

  // Update rotation interval
  const setRotationInterval = (minutes: number) => {
    setRotationIntervalState(minutes);
    localStorage.setItem(STORAGE_KEYS.ROTATION_INTERVAL, minutes.toString());
  };

  // Fetch uploaded images on mount
  useEffect(() => {
    fetchUploadedImages();
  }, []);

  // Auto-rotation timer
  useEffect(() => {
    if (!enabled || !autoRotate || uploadedImages.length === 0) return;

    const intervalMs = rotationInterval * 60 * 1000;
    const timerId = setInterval(() => {
      console.log('[CustomBackground] Auto-rotating to next image');
      nextImage();
    }, intervalMs);

    return () => clearInterval(timerId);
  }, [enabled, autoRotate, rotationInterval, uploadedImages.length, currentIndex]);

  return (
    <CustomBackgroundContext.Provider
      value={{
        enabled,
        toggleEnabled,
        currentImage,
        uploadedImages,
        fetchUploadedImages,
        nextImage,
        autoRotate,
        toggleAutoRotate,
        rotationInterval,
        setRotationInterval,
      }}
    >
      {children}
    </CustomBackgroundContext.Provider>
  );
};

export const useCustomBackground = (): CustomBackgroundContextType => {
  const context = useContext(CustomBackgroundContext);
  if (!context) {
    throw new Error('useCustomBackground must be used within CustomBackgroundProvider');
  }
  return context;
};


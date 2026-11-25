'use client';

import { useRef, useEffect } from 'react';

export const useGestureNavigation = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  enabled: boolean
) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const shakeRef = useRef<{ lastX: number; lastY: number; lastZ: number; lastTime: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Swipe detection (horizontal swipe > 50px in < 300ms)
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 300) {
        if (deltaX > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      }

      touchStartRef.current = null;
    };

    // Shake detection
    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const acceleration = e.accelerationIncludingGravity;
      if (!acceleration || !acceleration.x || !acceleration.y || !acceleration.z) return;

      const now = Date.now();
      
      if (shakeRef.current) {
        const deltaX = Math.abs(acceleration.x - shakeRef.current.lastX);
        const deltaY = Math.abs(acceleration.y - shakeRef.current.lastY);
        const deltaZ = Math.abs(acceleration.z - shakeRef.current.lastZ);

        // Shake threshold
        if (deltaX + deltaY + deltaZ > 30 && now - shakeRef.current.lastTime > 500) {
          // Shake detected - go to next page
          onSwipeLeft();
          shakeRef.current.lastTime = now;
        }
      }

      shakeRef.current = {
        lastX: acceleration.x,
        lastY: acceleration.y,
        lastZ: acceleration.z,
        lastTime: shakeRef.current?.lastTime || now,
      };
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('devicemotion', handleDeviceMotion);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [enabled, onSwipeLeft, onSwipeRight]);
};

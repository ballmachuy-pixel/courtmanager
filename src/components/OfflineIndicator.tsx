'use client';

import { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    function handleOffline() {
      setIsOffline(true);
      setShowBackOnline(false);
    }

    function handleOnline() {
      setIsOffline(false);
      setShowBackOnline(true);
      
      // Hide the "Back Online" message after 3 seconds
      setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);
    }

    // Set initial state
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showBackOnline) return null;

  return (
    <div className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 flex justify-center px-4 ${isOffline || showBackOnline ? 'translate-y-4' : '-translate-y-full opacity-0'}`}>
      <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border ${
        isOffline 
          ? 'bg-red-500/20 border-red-500/30 text-red-100 shadow-red-500/20' 
          : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100 shadow-emerald-500/20'
      }`}>
        {isOffline ? (
          <>
            <WifiOff size={16} className="text-red-400 animate-pulse" />
            <span className="text-[13px] font-bold tracking-wide">Mất kết nối mạng. Vui lòng kiểm tra 4G/Wifi!</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="text-[13px] font-bold tracking-wide">Đã kết nối lại thành công!</span>
          </>
        )}
      </div>
    </div>
  );
}

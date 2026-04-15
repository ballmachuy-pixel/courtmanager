'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';

export function StudentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [status, setStatus] = useState(searchParams.get('status') || '');

  // Handle typing search with a small delay (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set('q', search);
      else params.delete('q');
      
      router.push(`/students?${params.toString()}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, router, searchParams]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus) params.set('status', newStatus);
    else params.delete('status');
    
    router.push(`/students?${params.toString()}`);
    setShowFilters(false);
  };

  const isActiveFilters = searchParams.has('status');

  return (
    <div className="flex flex-col gap-3 relative z-50">
      <div className="flex flex-col sm:flex-row gap-4 border-b border-white/5 pb-6 mb-2 z-50 relative">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
             type="text" 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full bg-slate-950/50 border border-white/10 text-white rounded-xl py-2.5 pl-11 pr-10 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all text-sm" 
             placeholder="Tìm theo tên học viên..." 
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1">
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold transition-colors ${
              isActiveFilters || showFilters 
                ? 'bg-pink-500 border-pink-500 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-white border-white/10'
            }`}
          >
            <Filter size={18} /> Lọc trạng thái
          </button>

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="absolute top-14 left-0 sm:right-0 sm:left-auto w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl shadow-black/80 overflow-hidden z-[100]">
              <div className="flex flex-col">
                <button 
                  onClick={() => handleStatusChange('')}
                  className={`text-left px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors ${!status ? 'text-pink-400 bg-pink-500/10' : 'text-slate-300'}`}
                >
                  Tất cả trạng thái
                </button>
                <button 
                  onClick={() => handleStatusChange('active')}
                  className={`text-left px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors border-t border-white/5 ${status === 'active' ? 'text-pink-400 bg-pink-500/10' : 'text-slate-300'}`}
                >
                  Đã Active (Đang học)
                </button>
                <button 
                  onClick={() => handleStatusChange('inactive')}
                  className={`text-left px-4 py-3 text-sm font-medium hover:bg-white/5 transition-colors border-t border-white/5 ${status === 'inactive' ? 'text-pink-400 bg-pink-500/10' : 'text-slate-300'}`}
                >
                  Đã nghỉ / Tạm dừng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside backdrop for mobile dropdown */}
      {showFilters && (
        <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" onClick={() => setShowFilters(false)}></div>
      )}
    </div>
  );
}

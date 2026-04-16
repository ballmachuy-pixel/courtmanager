'use client';

import { MessageCircle, MessageSquare } from 'lucide-react';

export default function FloatingContact() {
  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
      {/* Messenger Button */}
      <a 
        href="https://m.me/sundaysunset22" 
        target="_blank"
        className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95 group relative"
      >
        <MessageCircle size={30} fill="currentColor" />
        <span className="absolute right-full mr-4 bg-slate-900 border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Nhắn tin Messenger
        </span>
      </a>

      {/* Zalo Button */}
      <a 
        href="https://zalo.me/0392412022" 
        target="_blank"
        className="w-14 h-14 bg-white text-blue-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95 group relative border-2 border-indigo-500/20"
      >
        <span className="font-black text-xl italic">Zalo</span>
        <span className="absolute right-full mr-4 bg-slate-900 border border-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat qua Zalo
        </span>
      </a>
    </div>
  );
}

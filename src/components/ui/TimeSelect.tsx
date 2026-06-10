'use client';
import { useState } from 'react';

export function TimeSelect({ name, defaultValue }: { name: string, defaultValue: string }) {
  const [h, m] = (defaultValue || '17:00').split(':');
  const [hour, setHour] = useState(h || '17');
  const [minute, setMinute] = useState(m || '00');
  
  return (
    <div className="flex items-center w-full bg-white/5 border border-white/10 text-white rounded-2xl py-1.5 px-3 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all shadow-2xl">
      <input type="hidden" name={name} value={`${hour}:${minute}`} />
      <select 
        value={hour} 
        onChange={e => setHour(e.target.value)}
        className="bg-transparent text-white text-lg font-black outline-none cursor-pointer appearance-none text-center flex-1 hover:bg-white/10 rounded-lg py-2"
      >
        {Array.from({length: 24}).map((_, i) => (
          <option key={i} value={i.toString().padStart(2, '0')} className="bg-slate-900 text-left">
            {i.toString().padStart(2, '0')}
          </option>
        ))}
      </select>
      <span className="text-white font-black opacity-50 px-1">:</span>
      <select 
        value={minute} 
        onChange={e => setMinute(e.target.value)}
        className="bg-transparent text-white text-lg font-black outline-none cursor-pointer appearance-none text-center flex-1 hover:bg-white/10 rounded-lg py-2"
      >
        {Array.from({length: 12}).map((_, i) => {
          const val = (i*5).toString().padStart(2, '0');
          return (
            <option key={val} value={val} className="bg-slate-900 text-left">{val}</option>
          );
        })}
      </select>
    </div>
  );
}

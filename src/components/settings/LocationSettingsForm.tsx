'use client';

import { useState } from 'react';
import { MapPin, Navigation, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { updateAcademyLocation } from '@/app/actions/academy';

interface Props {
  initialLat?: number | null;
  initialLng?: number | null;
  initialRadius?: number | null;
}

export default function LocationSettingsForm({ initialLat, initialLng, initialRadius }: Props) {
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [lat, setLat] = useState(initialLat?.toString() || '');
  const [lng, setLng] = useState(initialLng?.toString() || '');
  const [radius, setRadius] = useState(initialRadius?.toString() || '300');

  const handleGetCurrentLocation = () => {
    setLocating(true);
    setStatus(null);

    if (!navigator.geolocation) {
      setStatus({ type: 'error', message: 'Trình duyệt không hỗ trợ lấy vị trí.' });
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
        setLocating(false);
        setStatus({ type: 'success', message: 'Đã lấy tọa độ hiện tại thành công!' });
      },
      () => {
        setLocating(false);
        setStatus({ type: 'error', message: 'Không thể lấy vị trí. Hãy kiểm tra quyền GPS.' });
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    try {
      await updateAcademyLocation(formData);
      setStatus({ type: 'success', message: 'Đã cập nhật tọa độ trung tâm thành công!' });
    } catch (err: unknown) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Lỗi khi cập nhật.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="font-bold text-white flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
          <MapPin size={16} />
        </div>
        Cấu hình Geofencing
      </h3>
      <p className="text-slate-500 text-xs mb-5">
        Thiết lập tọa độ GPS sân tập để hệ thống kiểm tra vị trí khi HLV Check-in.
      </p>

      {status && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 mb-4 ${
          status.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {status.type === 'success' ? <CheckCircle size={14}/> : <AlertCircle size={14}/>}
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 block">Vĩ độ (Lat)</label>
            <input 
              name="latitude" type="number" step="any" required
              value={lat} onChange={(e) => setLat(e.target.value)} placeholder="21.xxxx"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder:text-slate-600"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 block">Kinh độ (Lng)</label>
            <input 
              name="longitude" type="number" step="any" required
              value={lng} onChange={(e) => setLng(e.target.value)} placeholder="105.xxxx"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder:text-slate-600"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1.5 block">Bán kính cho phép (m)</label>
          <input 
            name="radius" type="number" 
            value={radius} onChange={(e) => setRadius(e.target.value)} placeholder="300"
            className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-medium placeholder:text-slate-600"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button 
            type="button" onClick={handleGetCurrentLocation} disabled={locating}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {locating ? <Loader2 size={14} className="animate-spin"/> : <Navigation size={14}/>}
            Lấy vị trí
          </button>
          <button 
            type="submit" disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
            Lưu tọa độ
          </button>
        </div>
      </form>
    </div>
  );
}

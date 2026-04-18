'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2, AlertCircle, ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';
import { processCoachCheckin, processCoachCheckout } from '@/app/actions/coach';
import { StaffCheckin } from '@/types/database';

interface CheckinButtonProps {
  academyId: string;
  scheduleId?: string;
  classId?: string;
  className: string;
  currentCheckin?: StaffCheckin;
}

export function CheckinButton({ academyId, scheduleId, classId, className, currentCheckin }: CheckinButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGpsWarning, setShowGpsWarning] = useState(false);
  
  // New States for Explanation Flow
  const [requiresExplanation, setRequiresExplanation] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [explanation, setExplanation] = useState('');
  const [lastCoords, setLastCoords] = useState<{lat: number, lng: number} | null>(null);

  const isCheckedIn = !!currentCheckin && !currentCheckin.checked_out_at;
  const isCompleted = !!currentCheckin && !!currentCheckin.checked_out_at;

  const proceedWithoutGps = () => {
    setShowGpsWarning(false);
    setWarningMessage(error || 'Hệ thống không nhận được tín hiệu định vị.');
    setError('');
    setRequiresExplanation(true);
  };

  const submitAction = async (forced: boolean = false) => {
    if ('vibrate' in navigator) navigator.vibrate(50);
    
    if (forced && !explanation.trim()) {
      setError('Bắt buộc phải nhập lý do!');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let res;
      const payload = {
        academyId,
        scheduleId: scheduleId || '',
        latitude: lastCoords?.lat || null,
        longitude: lastCoords?.lng || null,
        notes: forced ? explanation : explanation || undefined,
        forceSave: forced
      };

      if (isCheckedIn) {
        res = await processCoachCheckout(payload);
      } else {
        res = await processCoachCheckin(payload);
      }
      
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      if (res.requiresExplanation && !forced) {
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
        setRequiresExplanation(true);
        setWarningMessage(res.warningMessage || 'Vị trí không hợp lệ.');
        setLoading(false);
        return;
      }

      setRequiresExplanation(false);
      setExplanation('');
      
      if (!isCheckedIn) {
        router.push(`/coach/classes/${scheduleId || 'today'}`);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      setError('Lỗi hệ thống khi gửi dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    if (isCompleted) return;
    if ('vibrate' in navigator) navigator.vibrate(50);
    setLoading(true);
    setError('');

    if (!('geolocation' in navigator)) {
      setError('Thiết bị hoặc trình duyệt không hỗ trợ định vị GPS.');
      setShowGpsWarning(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLastCoords({ lat: latitude, lng: longitude });
        
        try {
          let res;
          const payload = {
            academyId,
            scheduleId: scheduleId || '',
            latitude,
            longitude,
          };

          if (isCheckedIn) {
            res = await processCoachCheckout(payload);
          } else {
            res = await processCoachCheckin(payload);
          }

          if (res.error) {
            setError(res.error);
            setLoading(false);
            return;
          }

          if (res.requiresExplanation) {
            if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
            setRequiresExplanation(true);
            setWarningMessage(res.warningMessage || 'Vị trí không hợp lệ.');
            setLoading(false);
            return;
          }

          if ('vibrate' in navigator) navigator.vibrate(100);
          if (!isCheckedIn) {
            router.push(`/coach/classes/${scheduleId || 'today'}`);
          } else {
            router.refresh();
          }
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Lỗi hệ thống.');
          setLoading(false);
        }
      },
      (geoError) => {
        setLoading(false);
        setShowGpsWarning(true);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError('Bạn chưa cấp quyền GPS. Dữ liệu ghi nhận sẽ bị đánh dấu KHÔNG HỢP LỆ.');
        } else {
          setError('Lỗi kết nối GPS. Vui lòng bật mạng/vị trí.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (isCompleted) {
    return (
      <div className="w-full bg-slate-800/50 border border-white/5 text-slate-500 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 opacity-60">
        <CheckCircle2 size={22} className="text-slate-500" /> Đã Hoàn Thành Ca Dạy
      </div>
    );
  }

  if (requiresExplanation) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 space-y-4 animate-in relative overflow-hidden">
        <div className="text-red-400 text-sm font-bold flex items-start gap-3 relative z-10">
          <ShieldAlert size={20} className="shrink-0 mt-0.5" />
          <p>{warningMessage}</p>
        </div>
        
        {error && (
          <div className="text-red-400 text-xs font-bold bg-red-950/50 p-3 rounded-xl border border-red-500/10 relative z-10">{error}</div>
        )}
        
        <div className="space-y-2 relative z-10">
          <label className="text-[10px] text-red-300/80 font-black uppercase tracking-wider block">
            {isCheckedIn ? 'Ghi chú buổi dạy (Không bắt buộc)' : 'Lý do giải trình (Bắt buộc)'}
          </label>
          <textarea 
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder={isCheckedIn ? "Nhập nội dung buổi dạy hoặc ghi chú nhanh..." : "VD: Máy em bị lỗi GPS, em đang ở cửa sân..."}
            className="w-full bg-slate-900/50 border border-red-500/30 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
            rows={2}
          />
        </div>
        
        <div className="flex gap-3 relative z-10 pt-2">
          <button
            onClick={() => {
               setRequiresExplanation(false);
               setExplanation('');
               setError('');
            }}
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors active:scale-95"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={() => submitAction(true)}
            disabled={loading}
            className={`flex-[2] py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 text-sm ${
              isCheckedIn ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/25' : 'bg-red-600 hover:bg-red-500 shadow-red-600/25'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (isCheckedIn ? "XÁC NHẬN KẾT THÚC" : "GHI LÝ DO & VÀO LỚP")}
          </button>
        </div>
      </div>
    );
  }

  if (showGpsWarning) {
    return (
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5 space-y-4 animate-in">
        <div className="text-orange-400 text-sm font-bold flex items-start gap-3">
          <ShieldAlert size={20} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
        <button
          onClick={proceedWithoutGps}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-orange-600/25 active:scale-95 disabled:opacity-50 text-sm"
        >
          TIẾP TỤC VÀ GHI LÝ DO
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && !showGpsWarning && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" /> {error}
        </div>
      )}
      <button
        onClick={handleAction}
        disabled={loading}
        className={`w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-50 ${
          isCheckedIn 
            ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-orange-600/25'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25'
        }`}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          isCheckedIn ? <><LogOut size={22} /> Kết Thúc Ca Làm</> : <><MapPin size={22} /> Vào Điểm Danh Lớp</>
        )}
      </button>
    </div>
  );
}


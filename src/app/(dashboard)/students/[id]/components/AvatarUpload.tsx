'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, X, Check } from 'lucide-react';
import { updateStudentAvatar } from '@/app/actions/student';
import Image from 'next/image';

interface Props {
  studentId: string;
  currentAvatarUrl: string | null;
}

export default function AvatarUpload({ studentId, currentAvatarUrl }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setIsCameraActive(true);
    setIsMenuOpen(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Không thể truy cập máy ảnh.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const MAX_SIZE = 400;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPreview(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    setIsMenuOpen(false);
  };

  const handleUpload = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      await updateStudentAvatar(studentId, preview);
      setPreview(null);
      // Parent page will revalidate and show new avatar
    } catch (err) {
      alert("Lỗi khi tải ảnh lên.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      {/* Avatar Display & Trigger */}
      <div 
        className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl cursor-pointer hover:border-pink-500/50 transition-all"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {currentAvatarUrl ? (
          <Image src={currentAvatarUrl} alt="Avatar" fill className="object-cover" sizes="80px" />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
            <Camera size={24} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Camera size={20} className="text-white" />
        </div>
      </div>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 p-1 animate-in fade-in slide-in-from-top-1">
            <button 
              onClick={startCamera}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg text-sm font-bold text-white transition-colors"
            >
              <Camera size={16} className="text-pink-500" /> Chụp ảnh ngay
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg text-sm font-bold text-white transition-colors border-t border-white/5"
            >
              <Upload size={16} className="text-blue-500" /> Tải tệp lên
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
        </>
      )}

      {/* Camera UI */}
      {isCameraActive && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md aspect-square bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <button 
              onClick={stopCamera}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mt-8 flex items-center gap-6">
            <button 
              onClick={takePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
            >
              <div className="w-16 h-16 rounded-full border-4 border-slate-900"></div>
            </button>
          </div>
          <p className="mt-6 text-slate-400 text-sm font-bold uppercase tracking-widest">Đưa mặt bé vào khung hình</p>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Preview & Confirm UI */}
      {preview && (
        <div className="fixed inset-0 z-[101] bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-[2.5rem] overflow-hidden border-4 border-pink-500/30 shadow-2xl shadow-pink-500/20 mb-8">
            <Image src={preview} alt="Preview" fill className="object-cover" />
          </div>
          <div className="flex gap-4 w-full max-w-xs">
            <button 
              onClick={() => setPreview(null)}
              disabled={loading}
              className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition-colors"
            >
              Chụp lại
            </button>
            <button 
              onClick={handleUpload}
              disabled={loading}
              className="flex-[2] bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-pink-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              XÁC NHẬN LƯU
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

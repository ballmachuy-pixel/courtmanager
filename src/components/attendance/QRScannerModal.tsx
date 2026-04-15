'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface QRScannerModalProps {
  onScanResult: (decodedText: string) => void;
  onClose: () => void;
}

export function QRScannerModal({ onScanResult, onClose }: QRScannerModalProps) {
  const [error, setError] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scannerId = "attendance-qr-reader";
    
    // Khởi tạo scanner
    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" }, 
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            // Success handler
            if (scannerRef.current) {
              scannerRef.current.stop().then(() => {
                onScanResult(decodedText);
              }).catch(e => console.error(e));
            }
          },
          (errorMessage) => {
            // Ignored - usually just means no QR found yet
          }
        );
      } catch (err) {
        console.error("Lỗi Camera:", err);
        setError("Không thể mở Camera. Vui lòng cấp quyền sử dụng máy ảnh cho trình duyệt.");
      }
    };

    startScanner();

    // Cleanup
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScanResult]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '16px', flexDirection: 'column'
    }}>
      <div className="card w-full max-w-sm p-0 overflow-hidden relative">
        <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
           <h3 className="heading-4 flex items-center gap-2"><Camera size={20} /> Quét mã Thẻ Học Viên</h3>
           <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        
        {error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <div style={{ backgroundColor: '#000', width: '100%', minHeight: '300px' }}>
            <div id="attendance-qr-reader" style={{ width: '100%' }}></div>
          </div>
        )}
        
        <div style={{ padding: 'var(--space-4)', textAlign: 'center', background: '#f8f9fa' }}>
           <p className="text-sm text-muted">Đưa mã QR trên thẻ học sinh vào khung vuông trên màn hình để tự động điểm danh.</p>
        </div>
      </div>
    </div>
  );
}

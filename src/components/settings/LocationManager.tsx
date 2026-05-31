'use client';

import { useState } from 'react';
import { AcademyLocation } from '@/types/database';
import { upsertLocationAction, deleteLocationAction } from '@/app/actions/location';
import { MapPin, Plus, Trash2, Save, X } from 'lucide-react';

interface LocationManagerProps {
  initialLocations: AcademyLocation[];
}

export default function LocationManager({ initialLocations }: LocationManagerProps) {
  const [locations, setLocations] = useState<AcademyLocation[]>(initialLocations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(location: Partial<AcademyLocation>) {
    setLoading(true);
    try {
      await upsertLocationAction(location);
      window.location.reload(); // Re-fetch all for simplicity
    } catch (err) {
      alert('Lỗi khi lưu vị trí: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa sân tập này?')) return;
    setLoading(true);
    try {
      await deleteLocationAction(id);
      window.location.reload();
    } catch (err) {
      alert('Lỗi khi xóa vị trí: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Danh sách sân tập</h3>
          <p className="text-sm text-white/40">Quản lý các địa điểm tập luyện và cấu hình GPS.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding || !!editingId}
          className="flex items-center gap-2 rounded-xl bg-purple-600/10 px-4 py-2 text-xs font-bold text-purple-400 transition-all hover:bg-purple-600 hover:text-white disabled:opacity-50"
        >
          <Plus size={14} /> Thêm sân tập
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isAdding && (
          <LocationForm 
            onSave={handleSave} 
            onCancel={() => setIsAdding(false)} 
            loading={loading}
          />
        )}

        {locations.map((loc) => (
          editingId === loc.id ? (
            <LocationForm 
              key={loc.id}
              initialData={loc}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
              loading={loading}
            />
          ) : (
            <div key={loc.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-6 hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold">{loc.name}</h4>
                  <p className="text-xs text-white/40">{loc.address || 'Chưa cập nhật địa chỉ'}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] font-mono text-white/30 uppercase tracking-tighter">
                    <span>Lat: {loc.latitude || 'N/A'}</span>
                    <span>Lon: {loc.longitude || 'N/A'}</span>
                    <span>R: {loc.allowed_radius_m}m</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingId(loc.id)}
                  className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(loc.id)}
                  className="rounded-lg p-2 text-red-500/40 hover:bg-red-500/20 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        ))}

        {!isAdding && locations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
            <p className="text-sm text-white/20 uppercase font-black tracking-widest">Chưa có sân tập nào được thiết lập</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LocationForm({ initialData, onSave, onCancel, loading }: { initialData?: AcademyLocation; onSave: (data: Partial<AcademyLocation>) => void; onCancel: () => void; loading: boolean }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    allowed_radius_m: 300
  });

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          placeholder="Tên sân tập (VD: Sân bóng rổ ĐH Bách Khoa)"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-purple-500/50"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          placeholder="Địa chỉ"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-purple-500/50"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <input
          type="number"
          step="any"
          placeholder="Vĩ độ (Lat)"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-purple-500/50"
          value={formData.latitude}
          onChange={(e) => setFormData({ ...formData, latitude: e.target.value as any })}
        />
        <input
          type="number"
          step="any"
          placeholder="Kinh độ (Lon)"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-purple-500/50"
          value={formData.longitude}
          onChange={(e) => setFormData({ ...formData, longitude: e.target.value as any })}
        />
        <input
          type="number"
          placeholder="Bán kính (m)"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-purple-500/50"
          value={formData.allowed_radius_m}
          onChange={(e) => setFormData({ ...formData, allowed_radius_m: parseInt(e.target.value) })}
        />
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-sm font-bold text-white/40 hover:text-white"
        >
          Hủy
        </button>
        <button
          onClick={() => onSave(formData as any)}
          disabled={loading || !formData.name}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2 text-sm font-bold text-white hover:bg-purple-500 disabled:opacity-50"
        >
          {loading ? 'Đang lưu...' : <><Save size={16} /> Lưu sân tập</>}
        </button>
      </div>
    </div>
  );
}

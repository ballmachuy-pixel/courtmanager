'use client';

import { useState } from 'react';
import { Smile, Meh, Frown, X, Loader2, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { submitFeedbackAction } from '@/app/actions/feedback';

interface MicroFeedbackModalProps {
  academyId: string;
  venueId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MicroFeedbackModal({ academyId, venueId, isOpen, onClose }: MicroFeedbackModalProps) {
  const [rating, setRating] = useState<'GOOD' | 'NEUTRAL' | 'BAD' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!rating) return;
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      await submitFeedbackAction({
        academyId,
        venueId,
        userId: session.user.id,
        rating,
        comment
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setRating(null);
        setComment('');
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi gửi phản hồi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f0f] shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {!isSuccess ? (
          <div className="p-6 mt-4">
            <h3 className="text-lg font-bold text-center mb-1">Trải nghiệm sân hôm nay?</h3>
            <p className="text-xs text-white/50 text-center mb-6">Đánh giá của bạn giúp chúng tôi cải thiện chất lượng sân bãi.</p>

            <div className="flex justify-center gap-4 mb-6">
              <button 
                onClick={() => setRating('GOOD')}
                className={`p-4 rounded-2xl transition-all ${rating === 'GOOD' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 scale-110' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'} border`}
              >
                <Smile size={32} />
              </button>
              <button 
                onClick={() => setRating('NEUTRAL')}
                className={`p-4 rounded-2xl transition-all ${rating === 'NEUTRAL' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 scale-110' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'} border`}
              >
                <Meh size={32} />
              </button>
              <button 
                onClick={() => setRating('BAD')}
                className={`p-4 rounded-2xl transition-all ${rating === 'BAD' ? 'bg-red-500/20 border-red-500/50 text-red-400 scale-110' : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'} border`}
              >
                <Frown size={32} />
              </button>
            </div>

            {rating && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ thêm (không bắt buộc)..."
                  className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Gửi Phản Hồi</>}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center flex flex-col items-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
              <Smile size={32} />
            </div>
            <h3 className="text-lg font-bold text-emerald-400">Cảm ơn bạn!</h3>
            <p className="text-sm text-white/50 mt-1">Phản hồi đã được ghi nhận.</p>
          </div>
        )}
      </div>
    </div>
  );
}

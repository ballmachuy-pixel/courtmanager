import { BaseService } from './base.service';
import { NotificationService } from './notification.service';

export class FeedbackService extends BaseService {
  constructor(academyId: string) {
    super(academyId);
  }

  async submitVenueFeedback(params: {
    venueId: string;
    userId: string;
    rating: 'GOOD' | 'NEUTRAL' | 'BAD';
    comment?: string;
  }) {
    const { venueId, userId, rating, comment } = params;

    const { data, error } = await this.from('venue_feedbacks')
      .insert({
        academy_id: this.academyId,
        venue_id: venueId,
        user_id: userId,
        rating,
        comment
      })
      .select('*, venues(name)')
      .single();

    if (error) {
      return this.result(null, error);
    }

    // Nếu rating là BAD, gửi Telegram Alert
    if (rating === 'BAD') {
      const notificationService = new NotificationService(this.academyId);
      await notificationService.sendSystemAlert(
        `🚨 **Cảnh báo Sân bãi!**\nSân: ${(data as { venues?: { name?: string } }).venues?.name || venueId}\nĐánh giá: TỆ\nChi tiết: ${comment || 'Không có bình luận'}`
      );
    }

    return this.result(data);
  }
}

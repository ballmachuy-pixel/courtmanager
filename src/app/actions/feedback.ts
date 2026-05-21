'use server';

import { FeedbackService } from '@/lib/services/feedback.service';

export async function submitFeedbackAction(payload: {
  academyId: string;
  venueId: string;
  userId: string;
  rating: 'GOOD' | 'NEUTRAL' | 'BAD';
  comment?: string;
}) {
  const feedbackService = new FeedbackService(payload.academyId);
  const result = await feedbackService.submitVenueFeedback({
    venueId: payload.venueId,
    userId: payload.userId,
    rating: payload.rating,
    comment: payload.comment
  });
  
  if (result.error) {
    throw result.error;
  }
  
  return result.data;
}

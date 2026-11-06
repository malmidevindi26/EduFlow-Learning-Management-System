'use client';

import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEnrollment } from '@/hooks/useEnrollment';
import { api, getErrorMessage } from '@/lib/api';
import type { ReviewsResponse } from '@/lib/types';
import { toast } from 'sonner';
import CharCount from '@/components/ui/CharCount';

export default function ReviewSection({
    courseId,
    reviews,
}: {
    courseId: string
    reviews: ReviewsResponse | null
}) {
    const router = useRouter()
    const { user } = useAuth()
    const { enrollment } = useEnrollment(courseId)

    const mine = user ? reviews?.items.find((r) => r.user.id === user.id) : undefined
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if(mine) {
            setRating(mine.rating)
            setComment(mine.comment ?? '')
        }
    }, [mine])

    const canReview = user?.role === 'STUDENT' && !!enrollment

    async function handleSubmit(e: FormEvent){
        e.preventDefault()
        if(rating < 1){
            setError('Please choose a rating')
            return
        }
        setBusy(true)
        setError('')
        try {
            if(mine){
              await api.patch(`/reviews/${mine.id}`, { rating, comment: comment.trim() });
            }else {
                await api.post(`/courses/${courseId}/reviews`, {
                 rating,
                 comment: comment.trim() || undefined,
                });
            }
            toast.success(mine ? 'Review updated' : 'Thanks for your review')
            router.refresh()
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setBusy(false)
        }
    }

    async function handleDelete(){
        if(!mine || !window.confirm('Delete your review?')) return
        setBusy(true)
        try {
            await api.delete(`/reviews/${mine.id}`)
            setRating(0)
            setComment('')
            toast.success('Review deleted')
            router.refresh()
        } catch (error) {
            setError(getErrorMessage(error))
        }finally{
            setBusy(false)
        }
    }

    return (
    <section id="reviews" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Reviews</h2>

      {canReview && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="mb-2 text-sm font-medium">{mine ? 'Your review' : 'Rate this course'}</p>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n === 1 ? '' : 's'}`}
                className="text-amber-500"
              >
                <Star size={24} fill={n <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <div>
            <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Share your experience (optional)"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <CharCount value={comment} max={1000} />
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {mine ? 'Update review' : 'Submit review'}
            </button>
            {mine && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="text-sm text-slate-500 hover:text-red-600"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      {user?.role === 'STUDENT' && !enrollment && (
        <p className="mt-3 text-sm text-slate-500">Enroll in this course to leave a review.</p>
      )}

      {!reviews || reviews.items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No reviews yet.</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {reviews.items.map((review) => (
            <li key={review.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                  {review.user.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium">{review.user.name}</p>
                  <p className="text-xs text-amber-500">
                    {'★'.repeat(review.rating)}
                    <span className="text-slate-300">{'★'.repeat(5 - review.rating)}</span>
                  </p>
                </div>
              </div>
              {review.comment && <p className="mt-2 text-sm text-slate-600">{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
'use client';
import React, { useState } from 'react';
import { ChevronLeftIcon, PaperAirplaneIcon, CheckIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export const FeedbackScreen: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setError('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be logged in to submit feedback');
      }

      // Submit feedback
      const { error: submitError } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          feedback_text: feedback.trim()
        });

      if (submitError) {
        throw submitError;
      }

      // Show success state
      setShowSuccess(true);
      setFeedback('');
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        router.back();
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (showSuccess) {
    return (
      <div className="min-h-full bg-black flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-gray-400">Your feedback has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={handleBack}
            className="mr-3 p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Feedback</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Share Your Thoughts</h2>
          <p className="text-gray-400">
            Help us improve Zenlit by sharing your feedback, suggestions, or reporting issues.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-300 mb-2">
              Your Feedback *
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tell us what you think about Zenlit. What features do you love? What could be improved? Any bugs or issues you've encountered?"
              maxLength={1000}
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Help us make Zenlit better for everyone
              </p>
              <span className={`text-xs ${feedback.length > 900 ? 'text-red-400' : 'text-gray-400'}`}>
                {feedback.length}/1000
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !feedback.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-5 h-5" />
                Submit Feedback
              </>
            )}
          </button>
        </form>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-300 mb-2">Privacy Note</h3>
          <p className="text-xs text-blue-200">
            Your feedback is valuable to us and will be reviewed by our team. We may use your feedback to improve our app, but we will not share your personal information with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};
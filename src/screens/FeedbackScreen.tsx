import React, { useState } from 'react';
import { ChevronLeftIcon, PaperAirplaneIcon, CheckIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '../components/common/Button';
import { TextArea } from '../components/common/TextArea';
import { FormField } from '../components/common/FormField';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useAsync } from '../hooks/useAsync';
import { VALIDATION_RULES } from '../constants';

export const FeedbackScreen: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Use async hook for feedback submission
  const { loading: isSubmitting, execute: executeSubmit } = useAsync(async () => {
    return handleSubmit();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!feedback.trim()) {
      setError('Please enter your feedback');
      return;
    }

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
          <FormField label="Your Feedback" required error={error}>
            <TextArea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="h-32"
              placeholder="Tell us what you think about Zenlit. What features do you love? What could be improved? Any bugs or issues you've encountered?"
              maxLength={VALIDATION_RULES.FEEDBACK.MAX_LENGTH}
              showCharCount
              required
            />
          </FormField>

          {/* Error Message */}
          {error && (
            <ErrorMessage message={error} />
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !feedback.trim()}
            loading={isSubmitting}
            className="w-full"
            icon={<PaperAirplaneIcon className="w-5 h-5" />}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
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
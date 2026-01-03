import { Check, X } from 'lucide-react';
import { useState } from 'react';

export function FeedbackButtons() {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  return (
    <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
      <p className="text-center mb-4 text-gray-700">
        Is this identification correct?
      </p>
      
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setFeedback('yes')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all ${
            feedback === 'yes'
              ? 'bg-green-600 text-white shadow-lg scale-105'
              : 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300'
          }`}
        >
          <Check className="w-5 h-5" />
          Yes
        </button>
        
        <button
          onClick={() => setFeedback('no')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl transition-all ${
            feedback === 'no'
              ? 'bg-red-600 text-white shadow-lg scale-105'
              : 'bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-300'
          }`}
        >
          <X className="w-5 h-5" />
          No
        </button>
      </div>
      
      {feedback && (
        <p className="text-center mt-4 text-sm text-gray-600">
          Thank you for your feedback!
        </p>
      )}
    </div>
  );
}

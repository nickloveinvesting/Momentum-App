/**
 * Onboarding Assessment Page
 * Multi-step form for 23 assessment questions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AssessmentAnswer, AvoidanceZone } from '@momentum/shared';
import { assessmentAPI } from '@/lib/api';
import { useMomentumStore } from '@/lib/store';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';

// Sample questions (in real app, fetch from backend)
const QUESTIONS = [
  // Social (5 questions)
  { id: '1', category: 'social' as AvoidanceZone, question: 'How often do you avoid social gatherings?', type: 'frequency' },
  { id: '2', category: 'social' as AvoidanceZone, question: 'How uncomfortable are you initiating conversations with strangers?', type: 'scale' },
  { id: '3', category: 'social' as AvoidanceZone, question: 'When did you last reach out to make a new friend?', type: 'recency' },
  { id: '4', category: 'social' as AvoidanceZone, question: 'How often do you decline invitations due to social anxiety?', type: 'frequency' },
  { id: '5', category: 'social' as AvoidanceZone, question: 'Do you avoid speaking up in group settings?', type: 'binary' },

  // Physical (5 questions)
  { id: '6', category: 'physical' as AvoidanceZone, question: 'How often do you avoid physical discomfort?', type: 'frequency' },
  { id: '7', category: 'physical' as AvoidanceZone, question: 'How uncomfortable are you with intense exercise?', type: 'scale' },
  { id: '8', category: 'physical' as AvoidanceZone, question: 'When did you last push your physical limits?', type: 'recency' },
  { id: '9', category: 'physical' as AvoidanceZone, question: 'How often do you choose comfort over challenge?', type: 'frequency' },
  { id: '10', category: 'physical' as AvoidanceZone, question: 'Do you avoid trying new physical activities?', type: 'binary' },

  // Professional (5 questions)
  { id: '11', category: 'professional' as AvoidanceZone, question: 'How often do you avoid taking on new responsibilities?', type: 'frequency' },
  { id: '12', category: 'professional' as AvoidanceZone, question: 'How uncomfortable are you with public speaking at work?', type: 'scale' },
  { id: '13', category: 'professional' as AvoidanceZone, question: 'When did you last volunteer for a challenging project?', type: 'recency' },
  { id: '14', category: 'professional' as AvoidanceZone, question: 'How often do you avoid difficult conversations with colleagues?', type: 'frequency' },
  { id: '15', category: 'professional' as AvoidanceZone, question: 'Do you avoid asking for promotions or raises?', type: 'binary' },

  // Emotional (5 questions)
  { id: '16', category: 'emotional' as AvoidanceZone, question: 'How often do you avoid expressing vulnerable emotions?', type: 'frequency' },
  { id: '17', category: 'emotional' as AvoidanceZone, question: 'How uncomfortable are you with emotional intimacy?', type: 'scale' },
  { id: '18', category: 'emotional' as AvoidanceZone, question: 'When did you last have a deep emotional conversation?', type: 'recency' },
  { id: '19', category: 'emotional' as AvoidanceZone, question: 'How often do you suppress difficult feelings?', type: 'frequency' },
  { id: '20', category: 'emotional' as AvoidanceZone, question: 'Do you avoid conflict even when necessary?', type: 'binary' },

  // General preferences (3 questions)
  { id: '21', category: 'social' as AvoidanceZone, question: 'Preferred challenge duration?', type: 'preference' },
  { id: '22', category: 'social' as AvoidanceZone, question: 'Preferred pace of change?', type: 'preference' },
  { id: '23', category: 'social' as AvoidanceZone, question: 'What time of day works best for challenges?', type: 'preference' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile, setHasCompletedAssessment } = useMomentumStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = QUESTIONS[currentStep];
  const totalSteps = QUESTIONS.length;

  const handleAnswer = (value: number | string) => {
    const newAnswers = [
      ...answers.filter(a => a.questionId !== currentQuestion.id),
      { questionId: currentQuestion.id, value },
    ];
    setAnswers(newAnswers);

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await assessmentAPI.submitAssessment({ answers });
      setProfile(result.profile);
      setHasCompletedAssessment(true);
      router.push('/dashboard');
    } catch (error) {
      console.error('Assessment submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = () => {
    const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);

    switch (currentQuestion.type) {
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Not at all</span>
              <span>Extremely</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => handleAnswer(num)}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    currentAnswer?.value === num
                      ? 'border-primary-900 bg-primary-900 text-white'
                      : 'border-gray-300 hover:border-primary-500'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        );

      case 'frequency':
        return (
          <div className="space-y-3">
            {['Never', 'Rarely', 'Sometimes', 'Often', 'Always'].map((option, index) => (
              <button
                key={option}
                onClick={() => handleAnswer(index + 1)}
                className={`w-full py-4 px-6 rounded-lg border-2 text-left transition-all ${
                  currentAnswer?.value === index + 1
                    ? 'border-primary-900 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-500'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'recency':
        return (
          <div className="space-y-3">
            {['Within a week', 'Within a month', 'Within 6 months', 'Over a year ago', 'Never'].map((option, index) => (
              <button
                key={option}
                onClick={() => handleAnswer(index + 1)}
                className={`w-full py-4 px-6 rounded-lg border-2 text-left transition-all ${
                  currentAnswer?.value === index + 1
                    ? 'border-primary-900 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-500'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'binary':
        return (
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(1)}
              className={`flex-1 py-6 rounded-lg border-2 transition-all ${
                currentAnswer?.value === 1
                  ? 'border-primary-900 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-500'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer(0)}
              className={`flex-1 py-6 rounded-lg border-2 transition-all ${
                currentAnswer?.value === 0
                  ? 'border-primary-900 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-500'
              }`}
            >
              No
            </button>
          </div>
        );

      case 'preference':
        if (currentQuestion.id === '21') {
          return (
            <div className="space-y-3">
              {['5 minutes', '10 minutes', '15 minutes'].map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(['5min', '10min', '15min'][index])}
                  className={`w-full py-4 px-6 rounded-lg border-2 text-left transition-all ${
                    currentAnswer?.value === ['5min', '10min', '15min'][index]
                      ? 'border-primary-900 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          );
        } else if (currentQuestion.id === '22') {
          return (
            <div className="space-y-3">
              {['Gradual - small steps', 'Moderate - steady pace', 'Aggressive - rapid growth'].map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(['gradual', 'moderate', 'aggressive'][index])}
                  className={`w-full py-4 px-6 rounded-lg border-2 text-left transition-all ${
                    currentAnswer?.value === ['gradual', 'moderate', 'aggressive'][index]
                      ? 'border-primary-900 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          );
        } else {
          return (
            <div className="space-y-3">
              {['Morning', 'Afternoon', 'Evening'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option.toLowerCase())}
                  className={`w-full py-4 px-6 rounded-lg border-2 text-left transition-all ${
                    currentAnswer?.value === option.toLowerCase()
                      ? 'border-primary-900 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Assessment</h1>
          <p className="text-gray-600">
            Help us understand your avoidance patterns to personalize your challenges
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar current={currentStep + 1} total={totalSteps} className="mb-8" />

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQuestion.question}
          </h2>
          {renderQuestionInput()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>

          {currentStep === totalSteps - 1 && answers.length === totalSteps && (
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              Complete Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

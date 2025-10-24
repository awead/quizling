import { QuizInterface } from '@/components/quiz';

export default function QuizPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Take Quiz
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Test your knowledge
        </p>
      </div>

      <QuizInterface questionCount={15} />
    </div>
  );
}

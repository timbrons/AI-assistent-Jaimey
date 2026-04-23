'use client';

type Props = {
  questions: string[];
  onSelect: (question: string) => void;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'Goedemorgen';
  if (hour >= 12 && hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

export default function SuggestedQuestions({ questions, onSelect }: Props) {
  return (
    <div className="flex flex-col items-center px-4 py-10 h-full bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Welcome */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3 select-none" style={{ animation: 'bounce 2s infinite' }}>
          🌟
        </div>
        <h2 className="text-2xl font-extrabold text-purple-700 mb-2">
          {getGreeting()} Jaimey! 👋
        </h2>
        <p className="text-gray-600 text-lg font-semibold">
          Wat wil je mij vragen?
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Klik op een vraag hieronder, of typ zelf een vraag!
        </p>
      </div>

      {/* Questions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {questions.map((question, i) => (
          <button
            key={i}
            onClick={() => onSelect(question)}
            className="bg-white hover:bg-purple-50 border-2 border-purple-100 hover:border-purple-400 text-left px-4 py-3 rounded-2xl text-sm font-semibold text-gray-700 transition-all duration-150 hover:scale-[1.03] active:scale-[0.97] shadow-sm cursor-pointer"
          >
            {question}
          </button>
        ))}
      </div>

      <p className="mt-8 text-xs text-gray-400 text-center">
        💡 Tip: je kunt ook je eigen vraag typen!
      </p>
    </div>
  );
}

interface Question {
  id: string | number;
  question: string;
  image?: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: string;
}

interface Props {
  question: Question;
  selected?: string;
  onSelect(option: string): void;
}

export default function QuestionCard({ question, selected, onSelect }: Props) {
  return (
    <div className="border p-4 rounded">
      <p className="text-sm text-gray-600 mb-1">Difficulty: {question.difficulty}</p>
      <p className="mb-2">{question.question}</p>
      {question.image && <img src={question.image} alt="" className="mb-2" />}
      <div className="space-y-2">
        {question.options.map(opt => (
          <label key={opt} className="block">
            <input
              type="radio"
              name={`q-${question.id}`}
              value={opt}
              checked={selected === opt}
              onChange={() => onSelect(opt)}
              className="mr-2"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

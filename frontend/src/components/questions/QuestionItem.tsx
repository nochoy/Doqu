'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Question } from '@/types/question';
import { Edit, Trash } from 'lucide-react';

interface QuestionItemProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: (id: string) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, onUpdate, onDelete }) => {
  const getCorrectAnswer = () => {
    if ('answers' in question.correct_answer && question.correct_answer.answers) {
      return question.correct_answer.answers.join(', ');
    }
    if ('answer' in question.correct_answer) {
      return question.correct_answer.answer || 'N/A';
    }
    return 'N/A';
  };

  const renderPossibleAnswers = () => {
    const correctAnswer = getCorrectAnswer();
    return Object.entries(question.possible_answers).map(([key, value]) => {
      if (!value) return null;
      const isCorrect =
        question.type === 'SM' ? correctAnswer.includes(key) : correctAnswer === key;
      return (
        <li key={key} className={`text-sm ${isCorrect ? 'font-bold text-primary' : ''}`}>
          {key.toUpperCase()}: {value}
        </li>
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{question.question_text}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onUpdate(question)}>
              <Edit className="mr-2 h-4 w-4" />
              Update
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(question.id)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-2">
          <Badge variant="secondary">{question.type}</Badge>
          <p className="text-sm text-muted-foreground">
            Points: <span className="font-bold">{question.point_value}</span>
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <h4 className="font-semibold mb-2">Possible Answers:</h4>
          <ul className="list-disc pl-5 space-y-1">{renderPossibleAnswers()}</ul>
        </div>
        {question.explanation && (
          <div className="mt-4">
            <h4 className="font-semibold">Explanation:</h4>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionItem;

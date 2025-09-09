'use client';

// import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { questionSchema } from '@/types/validators';
import { FormData } from '@/types/validators';

const QUESTION_TEXT_MAX_LENGTH = 250;
const EXPLANATION_MAX_LENGTH = 250;

/**
 * Props:
 *    - onClose: Function that closes the model
 */
interface QuestionsCreateFormProps {
  onClose: () => void;
}

/**
 * @description This component renders a form for creating a question.
 * It uses react-hook-form and zod to validate the input fields.
 * The form data is sent to the server using a POST request when submitted.
 * @param {QuestionsCreateFormProps} props - An object containing the onClose function.
 * @returns {JSX.Element} A JSX element representing the form.
 */
export default function QuestionsCreateForm({ onClose }: QuestionsCreateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_text: '',
      type: 'MC',
      time_limit: 30,
      explanation: '',
      correct_answer: {},
      possible_answers: {},
    },
  });

  const questionType = watch('type');

  // Sets the initial state of the possible answers based on the selected question type.
  useEffect(() => {
    if (questionType === 'MC' || questionType === 'SM') {
      setValue('possible_answers', { a: '', b: '', c: '', d: '' });
    }
    if (questionType === 'TF') {
      setValue('possible_answers', { a: 'True', b: 'False' });
    }
  }, [questionType, setValue]);

  // Handles the submission of the questions builder form.
  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create question. Please try again');
      }

      await response.json();
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('An unknown error occurred');
      }
    }
  };

  /**
   * Renders the form for creating a question.
   */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="pb-0">
          <CardTitle>Question Builder</CardTitle>
          <CardDescription>Create a new question to add to the question bank.</CardDescription>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="h-[70vh] w-full mt-0">
            <CardContent className="space-y-6 p-6">
              {/* Question Text */}
              <div>
                <Label htmlFor="question_text">Question Title</Label>
                <Textarea
                  id="question_text"
                  rows={2}
                  placeholder="What is the capital of France?"
                  {...register('question_text')}
                  maxLength={QUESTION_TEXT_MAX_LENGTH}
                />
                {errors.question_text && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.question_text.message}
                  </p>
                )}
              </div>
              {/* Type / Time Limit*/}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select onValueChange={value => setValue('type', value as 'MC' | 'TF' | 'SM')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Multiple Choice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MC">Multiple Choice</SelectItem>
                      <SelectItem value="TF">True or False</SelectItem>
                      <SelectItem value="SM">Select Multiple</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm font-medium text-destructive">{errors.type.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="time_limit">Time Limit (seconds)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    {...register('time_limit', { valueAsNumber: true })}
                  />
                  {errors.time_limit && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.time_limit.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Explanation*/}
              <div>
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  rows={2}
                  placeholder="Additional Comments"
                  {...register('explanation')}
                  maxLength={EXPLANATION_MAX_LENGTH}
                />
              </div>

              {/* Possible Answers */}
              {(questionType === 'MC' || questionType === 'SM') && (
                <div>
                  <Label>Possible Answers</Label>
                  <div className="space-y-2">
                    <Input {...register('possible_answers.a')} placeholder="Answer A" />
                    <Input {...register('possible_answers.b')} placeholder="Answer B" />
                    <Input {...register('possible_answers.c')} placeholder="Answer C" />
                    <Input {...register('possible_answers.d')} placeholder="Answer D" />
                  </div>
                </div>
              )}

              {/* Correct Answer */}
              {questionType === 'MC' && (
                <div>
                  <Label htmlFor="correct_answer">Correct Answer</Label>
                  <Select onValueChange={value => setValue('correct_answer.answer', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a">Answer A</SelectItem>
                      <SelectItem value="b">Answer B</SelectItem>
                      <SelectItem value="c">Answer C</SelectItem>
                      <SelectItem value="d">Answer D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {questionType === 'TF' && (
                <div>
                  <Label htmlFor="correct_answer">Correct Answer</Label>
                  <Select onValueChange={value => setValue('correct_answer.answer', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a">True</SelectItem>
                      <SelectItem value="b">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {questionType === 'SM' && (
                <div>
                  <Label>Correct Answer</Label>
                  <MultiSelect
                    options={[
                      { value: 'a', label: 'Answer A' },
                      { value: 'b', label: 'Answer B' },
                      { value: 'c', label: 'Answer C' },
                      { value: 'd', label: 'Answer D' },
                    ]}
                    selected={watch('correct_answer.answers') || []}
                    onChange={selected => setValue('correct_answer.answers', selected)}
                  />
                </div>
              )}
            </CardContent>
          </ScrollArea>
          <CardFooter className="flex justify-end pt-4 space-x-3">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

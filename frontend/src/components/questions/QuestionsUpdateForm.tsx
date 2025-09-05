"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { questionSchema } from '@/types/validators';
import { FormData } from '@/types/validators';

const QUESTION_TEXT_MAX_LENGTH = 250;
const EXPLANATION_MAX_LENGTH = 250;

interface Question {
    id: string;
    question_text: string;
    type: "MC" | "TF" | "SM";
    time_limit: number;
    explanation: string;
    correct_answer: Record<string, any>;
    possible_answers: Record<string, any>;
}

/**
 * Props:
 *    - question: The question object to be updated
 *    - onClose: Function that closes the modal
 */
interface QuestionsUpdateFormProps {
    question: Question;
    onClose: () => void;
}

/**
 * @description This component renders a form for updating a question.
 * It uses react-hook-form and zod to validate the input fields.
 * The form data is sent to the server using a PUT request when submitted.
 * @param {QuestionsUpdateFormProps} props - An object containing the question and onClose function.
 * @returns {JSX.Element} A JSX element representing the form.
 */
export default function QuestionsUpdateForm({ question, onClose }: QuestionsUpdateFormProps) {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setValue,
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(questionSchema),
        defaultValues: {
            question_text: question.question_text,
            type: question.type,
            time_limit: question.time_limit,
            explanation: question.explanation,
            correct_answer: question.correct_answer,
            possible_answers: question.possible_answers,
        },
    });

    const questionType = watch('type');

    // Handles the submission of the questions builder form.
    const onSubmit = async (data: FormData) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/update/${question.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update question. Please try again');
            }

            await response.json();
            onClose();
        } catch (err: any) {
            // setError(err.message);
            console.error(err);
        }
    };

    // Renders the form for updating question.
    return (
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl relative">
            <h2 className="text-xl font-semibold mb-6">Update Question</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    {errors.question_text && <p className="text-red-500">{errors.question_text.message}</p>}
                </div>
                {/* Type / Time Limit*/}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={questionType}
                            onValueChange={(value) => setValue('type', value as "MC" | "TF" | "SM")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Multiple Choice" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MC">Multiple Choice</SelectItem>
                                <SelectItem value="TF">True or False</SelectItem>
                                <SelectItem value="SM">Select Multiple</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-red-500">{errors.type.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="time_limit">Time Limit (seconds)</Label>
                        <Input
                            id="time_limit"
                            type="number"
                            {...register('time_limit', { valueAsNumber: true })}
                        />
                        {errors.time_limit && <p className="text-red-500">{errors.time_limit.message}</p>}
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
                        {/* {errors.possible_answers?.a && <p className="text-red-500">{errors.possible_answers.a.message}</p>} */}
                    </div>
                )}

                {/* Correct Answer */}
                {questionType === 'MC' && (
                    <div>
                        <Label htmlFor="correct_answer">Correct Answer</Label>
                        <Select
                            value={watch('correct_answer.answer')}
                            onValueChange={(value) => setValue('correct_answer.answer', value)}
                        >
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
                        {/* {errors.correct_answer && 'answer' in errors.correct_answer && (
                            <p className="text-red-500">{errors.correct_answer.answer?.message}</p>
                        )} */}
                    </div>
                )}
                {questionType === 'TF' && (
                    <div>
                        <Label htmlFor="correct_answer">Correct Answer</Label>
                        <Select
                            value={watch('correct_answer.answer')}
                            onValueChange={(value) => setValue('correct_answer.answer', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select the correct answer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="a">True</SelectItem>
                                <SelectItem value="b">False</SelectItem>
                            </SelectContent>
                        </Select>
                        {/* {errors.correct_answer && 'answer' in errors.correct_answer && (
                            <p className="text-red-500">{errors.correct_answer.answer?.message}</p>
                        )} */}
                    </div>
                )}
                {questionType === 'SM' && (
                    <div>
                        <Label>Correct Answer</Label>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="a"
                                checked={watch('correct_answer.answers')?.includes('a')}
                                onCheckedChange={(checked) => {
                                    const currentAnswers = watch('correct_answer.answers') || [];
                                    if (checked && !currentAnswers.includes('a')) {
                                        setValue('correct_answer.answers', [...currentAnswers, 'a']);
                                    } else {
                                        setValue('correct_answer.answers', currentAnswers.filter((ans) => ans !== 'a'));
                                    }
                                }} />
                                <Label htmlFor="a">Answer A</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="b"
                                checked={watch('correct_answer.answers')?.includes('b')}
                                onCheckedChange={(checked) => {
                                    const currentAnswers = watch('correct_answer.answers') || [];
                                    if (checked && !currentAnswers.includes('b')) {
                                        setValue('correct_answer.answers', [...currentAnswers, 'b']);
                                    } else {
                                        setValue('correct_answer.answers', currentAnswers.filter((ans) => ans !== 'b'));
                                    }
                                }} />
                                <Label htmlFor="b">Answer B</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="c"
                                checked={watch('correct_answer.answers')?.includes('c')}
                                onCheckedChange={(checked) => {
                                    const currentAnswers = watch('correct_answer.answers') || [];
                                    if (checked && !currentAnswers.includes('c')) {
                                        setValue('correct_answer.answers', [...currentAnswers, 'c']);
                                    } else {
                                        setValue('correct_answer.answers', currentAnswers.filter((ans) => ans !== 'c'));
                                    }
                                }} />
                                <Label htmlFor="c">Answer C</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="d"
                                checked={watch('correct_answer.answers')?.includes('d')}
                                onCheckedChange={(checked) => {
                                    const currentAnswers = watch('correct_answer.answers') || [];
                                    if (checked && !currentAnswers.includes('d')) {
                                        setValue('correct_answer.answers', [...currentAnswers, 'd']);
                                    } else {
                                        setValue('correct_answer.answers', currentAnswers.filter((ans) => ans !== 'd'));
                                    }
                                }} />
                                <Label htmlFor="d">Answer D</Label>
                            </div>
                        </div>
                        {/* {errors.correct_answer && 'answers' in errors.correct_answer && (
                            <p className="text-red-500">{errors.correct_answer.answers?.message}</p>
                        )} */}
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end pt-4 space-x-3">
                    <Button 
                    variant="secondary"
                    type="button"
                    onClick={onClose}
                    >
                    Cancel
                    </Button>
                    <Button
                        type="submit"
                    >
                        Update
                    </Button>
                </div>
            </form>
            </div>
        </div>
    );
}

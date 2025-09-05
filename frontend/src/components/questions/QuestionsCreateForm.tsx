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
import { questionSchema } from '@/lib/validators';

/**
 * Props:
 *    - onClose: Function that closes the modal
 */
interface QuestionsCreateFormProps {
    onClose: () => void;
}

/**
 * Creating a Typescript type for the questions schema.
 * Matches the zod schema defined in the validators.ts file.
 */
type FormData = z.infer<typeof questionSchema>;

/**
 * @description This component renders a form for creating a question.
 * It uses react-hook-form and zod to validate the input fields.
 * The form data is sent to the server using a POST request when submitted.
 * @param {QuestionsCreateFormProps} props - An object containing the onClose function.
 * @returns {JSX.Element} A JSX element representing the form.
 */
export default function QuestionsCreateForm({ onClose }: QuestionsCreateFormProps) {
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
        // @ts-ignore
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

    /**
     * Sets the initial state of the possible answers based on the selected question type.
     */
    useEffect(() => {
        if (questionType === 'MC' || questionType === 'SM') {
            setValue('possible_answers', { a: '', b: '', c: '', d: '' });
        }
        if (questionType === 'TF') {
            setValue('possible_answers', { a: 'True', b: 'False' });
        }
    }, [questionType, setValue]);

    /**
     * Handles the submission of the questions builder form.
     */
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
        } catch (err: any) {
            // setError(err.message);
            console.error(err);
        }
    };
    const QUESTION_TEXT_MAX_LENGTH = 250;
    const EXPLANATION_MAX_LENGTH = 250;

    /**
     * Renders the form for creating a question.
     */
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl relative">
            <h2 className="text-xl font-semibold mb-6">Question Builder</h2>
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
                    </div>
                )}

                {/* Correct Answer */}
                {questionType === 'MC' && (
                    <div>
                        <Label htmlFor="correct_answer">Correct Answer</Label>
                        <Select
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
                        {errors.correct_answer && 'answer' in errors.correct_answer && <p className="text-red-500">{errors.correct_answer.answer?.message}</p>}
                    </div>
                )}
                {questionType === 'TF' && (
                    <div>
                        <Label htmlFor="correct_answer">Correct Answer</Label>
                        <Select
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
                        {errors.correct_answer && 'answer' in errors.correct_answer && <p className="text-red-500">{errors.correct_answer.answer?.message}</p>}
                    </div>
                )}
                {questionType === 'SM' && (
                    <div>
                        <Label>Correct Answer</Label>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="a" onCheckedChange={(checked) => {
                                    const currentAnswers = watch('correct_answer.answers') || [];
                                    if (checked) {
                                        // @ts-ignore
                                        setValue('correct_answer.answers', [...currentAnswers, 'a']);
                                    } else {
                                        // @ts-ignore
                                        setValue('correct_answer.answers', currentAnswers.filter((ans) => ans !== 'a'));
                                    }
                                }} />
                                <Label htmlFor="a">Answer A</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="b" onCheckedChange={(checked) => {
                                    const currentAnswers = watch('correct_answer.answers') || [];
                                    if (checked) {
                                        // @ts-ignore
                                        setValue('correct_answer.answers', [...currentAnswers, 'b']);
                                    } else {
                                        // @ts-ignore
                                        setValue('correct_answer.answers', currentAnswers.filter((ans) => ans !== 'b'));
                                    }
                                }} />
                                <Label htmlFor="b">Answer B</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="c" onCheckedChange={(checked) => {
                                    const currentAnswers = watch('correct_answer.answers') || [];
                                    if (checked) {
                                        // @ts-ignore
                                        setValue('correct_answer.answers', [...currentAnswers, 'c']);
                                    } else {
                                        // @ts-ignore
                                        setValue('correct_answer.answers', currentAnswers.filter((ans) => ans !== 'c'));
                                    }
                                }} />
                                <Label htmlFor="c">Answer C</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="d" onCheckedChange={(checked) => {
                                    const currentAnswers = watch('correct_answer.answers') || [];
                                    if (checked) {
                                        // @ts-ignore
                                        setValue('correct_answer.answers', [...currentAnswers, 'd']);
                                    } else {
                                        // @ts-ignore
                                        setValue('correct_answer.answers', currentAnswers.filter((ans) => ans !== 'd'));
                                    }
                                }} />
                                <Label htmlFor="d">Answer D</Label>
                            </div>
                        </div>
                        {errors.correct_answer && 'answers' in errors.correct_answer && <p className="text-red-500">{errors.correct_answer.answers?.message}</p>}
                    </div>
                )}


                {/* Form Actions */}
                <div className="flex justify-end pt-4 space-x-3">
                    <Button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                    >
                    Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                    >
                        Create
                    </Button>
                </div>
            </form>
            </div>
        </div>
    );
}

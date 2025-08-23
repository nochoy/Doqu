"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

interface QuizCreateFormProps {
    onClose: () => void;
}

interface QuizFormData {
    title: string;
    description: string;
    category: string;
    difficulty: number;
    is_public: boolean;
}

export default function QuizCreateForm({ onClose }: QuizCreateFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<QuizFormData>({
        title: '',
        description: '',
        category: '',
        difficulty: 1,
        is_public: true,
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        const isCheckbox = type === 'checkbox';
        let inputValue: string | boolean | number = isCheckbox 
            ? (e.target as HTMLInputElement).checked 
            : value;

        if (name === 'difficulty') {
            inputValue = Number(value);
        }

        setFormData(prev => ({ ...prev, [name]: inputValue as any }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create quiz. Please try again');
            }

            const newQuiz = await response.json();
            router.push(`/quiz/${newQuiz.id}/edit`);

        } catch (err: any) {
            setError(err.message);
        }
    };
    const TITLE_MAX_LENGTH = 50;
    const DESC_MAX_LENGTH = 250;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl relative">
                {/* X Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            <h2 className="text-xl font-semibold mb-6">Quiz Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                </label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Untitled Quiz"
                    maxLength={TITLE_MAX_LENGTH}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className={`text-xs text-right mt-1 ${formData.title.length > TITLE_MAX_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                    {formData.title.length}/{TITLE_MAX_LENGTH}
                </p>
                </div>

                {/* Description*/}
                <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                </label>
                <textarea
                    name="description"
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="A fun quiz!"
                    maxLength={DESC_MAX_LENGTH}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className={`text-xs text-right mt-1 ${formData.description.length > DESC_MAX_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                    {formData.description.length}/{DESC_MAX_LENGTH}
                </p>
                </div>

                {/* Category / Difficulty*/}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                    </label>
                    <select
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                    <option value="Arts">Arts</option>
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Computers">Computers</option>
                    <option value="English">English</option>
                    <option value="Fun">Fun</option>
                    <option value="Geography">Geography</option>
                    <option value="History">History</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Science">Science</option>            
                    <option value="Social Studies">Social Studies</option>  
                    </select>
                </div>
                <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty (1-5)
                    </label>
                    <select
                        name="difficulty"
                        id="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                    <option value={1}>1 (Easiest)</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5 (Hardest)</option>
                    </select>
                </div>
                </div>

                {/* Public/Private Toggle */}
                <div>
                <label className="block text-sm font-medium text-gray-700">Visibility</label>
                <div className="mt-2 p-1 rounded-lg flex items-center bg-gray-200 relative w-full h-11">
                    {/* Sliding purple bar */}
                    <span
                    className={`absolute top-1 h-9 w-1/2 rounded-md bg-indigo-600 shadow-md transform transition-transform duration-300 ease-in-out
                        ${formData.is_public ? 'translate-x-0' : 'translate-x-full'}`
                    }
                    style={{ left: '2px' }}
                    />

                    {/* Public Button */}
                    <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_public: true })}
                    className={`w-1/2 h-full rounded-md text-sm font-medium z-10 transition-colors duration-300 cursor-pointer
                        ${formData.is_public ? 'text-white' : 'text-gray-700'}` 
                    }
                    >
                    Public
                    </button>

                    {/* Private Button */}
                    <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_public: false })}
                    className={`w-1/2 h-full rounded-md text-sm font-medium z-10 transition-colors duration-300 cursor-pointer
                        ${!formData.is_public ? 'text-white' : 'text-gray-700'}` 
                    }
                    >
                    Private
                    </button>
                </div>
                </div>
                
                {error && <p className="text-sm text-red-600">{error}</p>}

                {/* Form Actions */}
                <div className="flex justify-end pt-4 space-x-3">
                    <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                    >
                    Cancel
                    </button>
                    <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                    >
                        Create
                    </button>
                </div>
            </form>
            </div>
        </div>
    );
}
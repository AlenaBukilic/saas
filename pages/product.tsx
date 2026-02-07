"use client"

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useAuth } from '@clerk/nextjs';
import { Protect, PricingTable, UserButton } from '@clerk/nextjs';

function IdeaGenerator() {
    const { getToken } = useAuth();
    const [idea, setIdea] = useState<string>('…loading');

    useEffect(() => {
        let cancelled = false;

        const fetchIdea = async (retryAfter403 = false) => {
            const jwt = await getToken();
            if (!jwt) {
                if (!cancelled) setIdea('Authentication required');
                return;
            }

            const res = await fetch('/api', {
                headers: { Authorization: `Bearer ${jwt}` },
            });

            if (cancelled) return;

            if (res.ok) {
                const text = await res.text();
                setIdea(text);
                return;
            }

            if (res.status === 403 && !retryAfter403) {
                setIdea('Refreshing…');
                await fetchIdea(true);
                return;
            }

            if (res.status === 403) {
                setIdea('Access denied. Please sign out and sign back in.');
                return;
            }

            setIdea(`Request failed (${res.status}). Please try again.`);
        };

        fetchIdea();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="container mx-auto px-4 py-12">
            <header className="text-center mb-12">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    Business Idea Generator
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    AI-powered innovation at your fingertips
                </p>
            </header>

            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-95">
                    {idea === '…loading' || idea === 'Refreshing…' ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="animate-pulse text-gray-400">
                                {idea === 'Refreshing…' ? 'Refreshing…' : 'Generating your business idea...'}
                            </div>
                            <p className="text-sm text-gray-400">This may take 15–30 seconds.</p>
                        </div>
                    ) : (
                        <div className="markdown-content text-gray-700 dark:text-gray-300">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                {idea}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Product() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="absolute top-4 right-4">
                <UserButton showName={true} />
            </div>

            <Protect
                plan="premium_subscription"
                fallback={
                    <div className="container mx-auto px-4 py-12">
                        <header className="text-center mb-12">
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                                Choose Your Plan
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                                Unlock unlimited AI-powered business ideas
                            </p>
                        </header>
                        <div className="max-w-4xl mx-auto">
                            <PricingTable />
                        </div>
                    </div>
                }
            >
                <IdeaGenerator />
            </Protect>
        </main>
    );
}

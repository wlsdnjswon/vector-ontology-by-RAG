// components/suggested-questions.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface SuggestedQuestionsProps {
    questions: string[]
    onQuestionClick: (question: string) => void
}

export default function SuggestedQuestions({ questions, onQuestionClick }: SuggestedQuestionsProps) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div className="mb-6">
            <Button 
                variant="outline" 
                onClick={() => setIsVisible(!isVisible)}
                className="mb-2 w-full"
            >
                {isVisible ? "추천 질문 숨기기" : "추천 질문 보기"}
            </Button>

            {isVisible && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {questions.map((question, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            className="justify-start text-left h-auto py-2 px-3 whitespace-normal"
                            onClick={() => onQuestionClick(question)}
                        >
                            {question}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    )
}

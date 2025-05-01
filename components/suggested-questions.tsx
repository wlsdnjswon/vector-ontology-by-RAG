// components/suggested-questions.tsx
"use client"

import { Button } from "@/components/ui/button"

interface SuggestedQuestionsProps {
    questions: string[]
    onQuestionClick: (question: string) => void
}

export default function SuggestedQuestions({ questions, onQuestionClick }: SuggestedQuestionsProps) {
    return (
        <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">추천 질문:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {questions.map((question, index) => (
                    <Button
                        key={index}
                        variant="outline"
                        // 1. `whitespace-normal` 추가: 텍스트가 자동으로 줄바꿈되도록 합니다.
                        // 2. `h-auto`는 이미 있어서 버튼 높이가 내용에 맞게 늘어납니다.
                        // 3. `text-left`는 줄바꿈 시 왼쪽 정렬을 유지합니다.
                        className="justify-start text-left h-auto py-2 px-3 whitespace-normal"
                        onClick={() => onQuestionClick(question)}
                    >
                        {question}
                    </Button>
                ))}
            </div>
        </div>
    )
}
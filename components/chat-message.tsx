// components/chat-message.tsx

import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown, { Options } from 'react-markdown' // react-markdown 및 Options 타입 임포트
import remarkGfm from 'remark-gfm' // remark-gfm 임포트
import { ClassAttributes, AnchorHTMLAttributes, ElementType } from "react"; // React 타입 추가

// components prop 타입 강화를 위한 ExtraProps 정의 (선택적이지만 권장)
type ExtraProps = {
    node?: any; // remark 노드 정보 (필요시 활용)
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
};

// a 태그 컴포넌트 타입 정의
type Components = Options['components'] & {
    a?: ElementType<ClassAttributes<HTMLAnchorElement> & AnchorHTMLAttributes<HTMLAnchorElement> & ExtraProps>;
    // 다른 태그 타입도 필요시 추가 가능
};

interface ChatMessageProps {
    role: "user" | "assistant"; // 타입을 명확히
    content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === "user"
    const isEmptyAssistant = role === 'assistant' && content.length === 0; // 빈 응답 확인

    // --- components prop 정의 ---
    const markdownComponents: Components = {
        // 링크를 새 탭에서 열고 스타일 적용
        a: ({ node, ...props }) => (
            <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline font-medium" // 스타일 수정 (Tailwind 클래스)
            />
        ),
        // 다른 태그 스타일링 필요 시 여기에 추가
        // 예: p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
        //     ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 mb-2" {...props} />,
        //     ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 mb-2" {...props} />,
        //     strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
    };

    return (
        <div className={cn(
            "flex items-start space-x-2 p-2 rounded-lg w-full", // 기본 스타일
            isUser ? "justify-end" : "justify-start" // 사용자/봇 메시지 정렬
        )}>
            <div className={cn("flex items-start space-x-2 max-w-[85%]", isUser ? "flex-row-reverse space-x-reverse" : "")}> {/* 내용 정렬 */}
                {/* 아이콘 부분 */}
                <div className={cn(
                    "flex-shrink-0 mt-1 p-1.5 rounded-full", // 아이콘 크기 및 패딩 조정
                    isUser ? "bg-gray-200" : "bg-blue-100"
                )}>
                    {isUser ? (
                        <User className="h-4 w-4 text-gray-600" />
                    ) : (
                        <Bot className="h-4 w-4 text-blue-600" />
                    )}
                </div>

                {/* 메시지 내용 부분 */}
                <div className={cn(
                    "flex-1 p-3 rounded-lg shadow-sm text-sm md:text-base", // 텍스트 크기 추가
                    isUser ? "bg-indigo-600 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none" // 색상 변경
                )}>
                    {/* <p className="text-xs font-medium mb-1 opacity-80">{isUser ? "사용자" : "AI 도우미"}</p> */}

                    {/* --- 마크다운 렌더링 --- */}
                    {isEmptyAssistant ? (
                        // 로딩 중 점 애니메이션 (타이핑 효과 시작 전)
                        <div className="h-5 flex items-center space-x-1">
                            <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                            <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                            <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                        </div>
                    ) : (
                        // --- ReactMarkdown을 div로 감싸고 className 적용 ---
                        <div className="prose prose-sm max-w-none prose-indigo">
                            {/* prose-indigo 추가 (Tailwind Typography 사용 시) */}
                            {/* 링크 스타일은 components prop에서 제어 */}
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]} // GFM 플러그인 사용
                                components={markdownComponents} // 커스텀 컴포넌트 적용
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
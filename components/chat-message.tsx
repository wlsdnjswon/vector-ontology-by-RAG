// components/chat-message.tsx

import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown, { Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ClassAttributes, AnchorHTMLAttributes, ElementType } from "react"
import { Node } from 'unist' // remark 노드 타입 임포트

// ExtraProps 타입 정의
type ExtraProps = {
    node?: Node; // 'any' 대신 명확한 타입 사용
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
};

// a 태그 컴포넌트 타입 정의
type Components = Options['components'] & {
    a?: ElementType<ClassAttributes<HTMLAnchorElement> & AnchorHTMLAttributes<HTMLAnchorElement> & ExtraProps>;
};

interface ChatMessageProps {
    role: "user" | "assistant"; // 타입을 명확히
    content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === "user"
    const isEmptyAssistant = role === 'assistant' && content.length === 0;

    const markdownComponents: Components = {
        a: ({ node: _node, ...props }) => ( // 'node'를 '_node'로 변경
            <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline font-medium"
            />
        ),
    };

    return (
        <div className={cn(
            "flex items-start space-x-2 p-2 rounded-lg w-full",
            isUser ? "justify-end" : "justify-start"
        )}>
            <div className={cn("flex items-start space-x-2 max-w-[85%]", isUser ? "flex-row-reverse space-x-reverse" : "")}>
                <div className={cn(
                    "flex-shrink-0 mt-1 p-1.5 rounded-full",
                    isUser ? "bg-gray-200" : "bg-blue-100"
                )}>
                    {isUser ? (
                        <User className="h-4 w-4 text-gray-600" />
                    ) : (
                        <Bot className="h-4 w-4 text-blue-600" />
                    )}
                </div>

                <div className={cn(
                    "flex-1 p-3 rounded-lg shadow-sm text-sm md:text-base",
                    isUser ? "bg-indigo-600 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"
                )}>
                    {isEmptyAssistant ? (
                        <div className="h-5 flex items-center space-x-1">
                            <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                            <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                            <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none prose-indigo">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
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
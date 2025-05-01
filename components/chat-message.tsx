// components/chat-message.tsx

import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown, { Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
// ClassAttributes, AnchorHTMLAttributes, ElementType 등은 markdownComponents 구현 방식에 따라 불필요할 수 있습니다.
// Options['components']만 사용하는 것이 더 간단할 수 있습니다.
// import { ClassAttributes, AnchorHTMLAttributes, ElementType } from "react"
// import { Node } from 'unist' // 'node'를 명시적으로 사용하지 않으므로 이 임포트도 제거 가능

interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === "user"
    const isEmptyAssistant = role === 'assistant' && content.length === 0;

    const markdownComponents: Options['components'] = {
        // 'node'는 사용하지 않으므로 구조 분해 할당에서 제거했습니다.
        // props에는 href, children 등이 포함됩니다.
        a: ({ children, ...props }) => (
            <a
                {...props} // href, title 등 ReactMarkdown이 전달하는 속성 포함
                target="_blank" // '=' 앞뒤 공백 제거 (올바른 JSX 문법)
                rel="noopener noreferrer" // '=' 앞뒤 공백 제거 (올바른 JSX 문법)
                className="text-indigo-600 hover:text-indigo-800 underline font-medium" // '=' 앞뒤 공백 제거 (올바른 JSX 문법)
            >
                {children} {/* children을 명시적으로 전달 */}
            </a>
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
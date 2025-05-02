// app/page.tsx
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import SuggestedQuestions from "@/components/suggested-questions"
import ChatMessage from "@/components/chat-message"
import { cn } from "@/lib/utils" // cn 유틸리티 임포트 (선택 사항)

// --- Define Message Type ---
interface Message {
    role: "user" | "assistant";
    content: string;
    completed?: boolean; // Optional for assistant messages during typing
}

// Initial message and suggested questions
const initialMessages: Message[] = [
    {
        role: "assistant",
        content: "안녕하세요! RAG 챗봇입니다. 개발자에 대해 이것저것 질문해 보세요! 서버가 실행되는 첫 답변은 답변에 1~2분정도 시간이 걸릴 수 있습니다!",
        completed: true,
    },
];

// --- Update suggested questions based on your RAG system's capabilities ---
const suggestedQuestionsList = [
    "정진원이 누구인지 정리해서 설명해줘.",
    "SAR 선박 영상의 시멘틱 분할 성능 향상 논문은 무슨 내용이야?",
    "정진원의 특허 정보와 관련 출원 서류 파일 찾아줘.",
    "정진원이 받은 특허는 어떤 내용이야?",
];

export default function Home() {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showDevInfo, setShowDevInfo] = useState(false)
    const [currentTypingIndex, setCurrentTypingIndex] = useState(-1)
    const [displayedText, setDisplayedText] = useState("")

    const chatContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null);
    const devInfoRef = useRef<HTMLDivElement>(null);

    // --- 스크롤 로직 (변경 없음) ---
    const scrollToBottom = useCallback((force = false) => {
        if (chatContainerRef.current) {
            const { scrollHeight, clientHeight, scrollTop } = chatContainerRef.current;
            const isScrolledUp = scrollHeight - scrollTop > clientHeight + 50;
            if (force || !isScrolledUp || isLoading || currentTypingIndex >= 0) {
                requestAnimationFrame(() => {
                    chatContainerRef.current?.scrollTo({ top: scrollHeight, behavior: 'smooth' });
                });
            }
        }
    }, [isLoading, currentTypingIndex]);

    useEffect(() => {
        const scrollTimer = setTimeout(() => {
            const isNewMessage = messages.length > initialMessages.length;
            const isBotTyping = messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !messages[messages.length - 1].completed;
            scrollToBottom(isNewMessage || isBotTyping);
        }, 50);
        return () => clearTimeout(scrollTimer);
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (currentTypingIndex >= 0) {
            const typingScrollTimer = setTimeout(() => {
                scrollToBottom(true);
            }, 50);
            return () => clearTimeout(typingScrollTimer);
        }
    }, [displayedText, currentTypingIndex, scrollToBottom]);

    useEffect(() => {
        const initialScrollTimer = setTimeout(() => {
            scrollToBottom(true);
        }, 100);
        return () => clearTimeout(initialScrollTimer);
    }, [scrollToBottom]);
    // --- End of Scroll functions ---

    // --- Typing Effect (변경 없음) ---
    useEffect(() => {
        if (currentTypingIndex >= 0 && currentTypingIndex < messages.length) {
            const message = messages[currentTypingIndex];
            if (message && !message.completed && message.role === 'assistant') {
                const fullText = message.content;
                const i = displayedText.length;
                if (i < fullText.length) {
                    const typingSpeed = 15;
                    const timer = setTimeout(() => setDisplayedText(fullText.substring(0, i + 1)), typingSpeed);
                    return () => clearTimeout(timer);
                } else {
                    setMessages(prevMessages => {
                        const updated = [...prevMessages];
                        if (updated[currentTypingIndex]) {
                            updated[currentTypingIndex] = { ...updated[currentTypingIndex], completed: true };
                        }
                        return updated;
                    });
                    setCurrentTypingIndex(-1);
                    setDisplayedText("");
                }
            } else {
                if (currentTypingIndex !== -1) {
                    setCurrentTypingIndex(-1);
                    setDisplayedText("");
                }
            }
        }
    }, [currentTypingIndex, displayedText, messages]);
    // --- End of Typing Effect ---

    // --- 외부 클릭 감지 (변경 없음) ---
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (devInfoRef.current && !devInfoRef.current.contains(event.target as Node)) setShowDevInfo(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [devInfoRef]);
    // --- End of 외부 클릭 감지 ---

    // --- 메시지 전송 및 API 호출 함수 (변경 없음) ---
    const handleSendMessage = async (message: string) => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || isLoading) return;
        const newUserMessage: Message = { role: "user", content: trimmedMessage, completed: true };
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInput("");
        setIsLoading(true);
        inputRef.current?.blur();

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                console.error("API URL 환경 변수(NEXT_PUBLIC_API_URL)가 설정되지 않았습니다.");
                setMessages(prev => [...prev, { role: "assistant", content: "오류: 챗봇 설정을 불러올 수 없습니다. 관리자에게 문의하세요.", completed: true }]);
                setIsLoading(false);
                return;
            }
            const response = await fetch(apiUrl, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: trimmedMessage }),
            });
            setIsLoading(false);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "응답 본문 파싱 실패" }));
                console.error("API Error Response:", response.status, errorData);
                setMessages(prev => [...prev, { role: "assistant", content: `오류: ${errorData.error || `서버 응답 코드 ${response.status}`}`, completed: true }]);
                return;
            }
            const data = await response.json();
            const assistantResponse = typeof data.response === 'string' ? data.response : "죄송합니다. 유효하지 않은 응답 형식입니다.";
            const assistantMessagePlaceholder: Message = { role: "assistant", content: assistantResponse, completed: false };
            setMessages(prevMessages => [...prevMessages, assistantMessagePlaceholder]);
        } catch (error) {
            console.error("Fetch API Error:", error);
            setIsLoading(false);
            setMessages(prev => [...prev, { role: "assistant", content: "죄송합니다. API 서버 연결에 실패했습니다.", completed: true }]);
        }
    };
    // --- End of handleSendMessage ---

    // currentTypingIndex 설정 (변경 없음)
    useEffect(() => {
        if (messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !messages[messages.length - 1].completed) {
            setCurrentTypingIndex(messages.length - 1);
        }
    }, [messages]);

    // 추천 질문 클릭 핸들러 (변경 없음)
    const handleQuestionClick = (question: string) => {
        setInput(question);
        inputRef.current?.focus();
    };

    // --- JSX 렌더링 ---
    return (
        // 전체 배경은 여전히 전체 화면 차지
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* 채팅 인터페이스 컨테이너: 기본적으로 전체 너비, lg 이상에서는 max-w-3xl, 중앙 정렬, 그림자/테두리 추가 */}
            <div className={cn(
                "flex flex-col w-full bg-white overflow-hidden", // 기본 스타일 (모바일)
                "lg:max-w-5xl lg:h-[90vh] lg:rounded-xl lg:shadow-3xl lg:border lg:border-gray-200", // lg 이상 화면에서의 스타일
                "h-[95vh]" // 모바일 화면에서의 높이 (상하단 여백 조금 주기 위해 100vh 대신 사용)
            )}>
                {/* Header Section */}
                <div className="flex items-center justify-between p-3 md:p-4 border-b bg-white sticky top-0 z-10 flex-shrink-0">
                    {/* 헤더 내용 (변경 없음) */}
                    <div className="flex items-center min-w-0">
                        <Bot className="h-6 w-6 md:h-8 md:w-8 mr-2 text-indigo-600 flex-shrink-0" />
                        <h1 className="text-base md:text-xl font-semibold text-gray-800 truncate">
                            온톨로지&백터 기반 RAG 챗봇
                        </h1>
                    </div>
                    <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                        {/* 개발자 정보 버튼 및 드롭다운 */}
                        <div className="relative" ref={devInfoRef}>
                            {/* 개발자 정보 버튼 (변경 없음) */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center space-x-1 text-xs md:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md p-2"
                                onClick={() => setShowDevInfo(prev => !prev)}
                                title="개발자 정보"
                            >
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">개발자 정보</span>
                                {showDevInfo ? <ChevronUp className="h-4 w-4 ml-1 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 ml-1 flex-shrink-0" />}
                            </Button>

                            {/* 드롭다운 메뉴 */}
                            {showDevInfo && (
                                <div
                                    className={
                                        "absolute left-1/2 md:left-auto md:right-0 mt-2 w-60 max-w-[80vw] md:w-64 " + // 너비 및 최대 너비 설정
                                        "bg-white rounded-md shadow-lg p-3 md:p-4 z-30 border text-xs md:text-sm " + // 스타일링
                                        "transform -translate-x-1/2 md:translate-x-0 " + // **핵심: 가운데 정렬 (모바일), 오른쪽 정렬 (md 이상)**
                                        "animate-in fade-in duration-150" // 애니메이션
                                    }>
                                    {/* 개발자 정보 내용 */}
                                    <h3 className="font-semibold text-gray-900 mb-2">개발자 정보</h3>
                                    <p className="text-gray-700 mb-1">이름: 정진원</p>
                                    <p className="text-gray-700 mb-1">연락처: <a href="tel:010-7352-5435" className="text-indigo-600 hover:underline">010-7352-5435</a></p>
                                    <p className="text-gray-700 mb-1 break-all">
                                        이메일: <a href="mailto:wlsdnjswon@gmail.com" className="text-indigo-600 hover:underline">wlsdnjswon@gmail.com</a>
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1 pt-1 border-t">© MIT License</p>
                                    <p className="text-gray-500 text-xs mt-3">구현과 관련된 자세한 사항은 GitHub를 참고해 주세요.</p>
                                </div>
                            )}
                        </div>
                        <a href="https://scholar.google.co.kr/citations?user=H8Fz07YAAAAJ&hl=ko&authuser=1/" target="_blank" rel="noopener noreferrer" title="Google Scholar">
                            <Button variant="outline" size="sm" className="flex items-center space-x-1 text-xs md:text-sm px-2 py-2">
                                <span className="hidden sm:inline">Google Scholar</span>
                                <span className="sm:hidden">Scholar</span>
                                <ExternalLink className="h-4 w-4 ml-1 flex-shrink-0" />
                            </Button>
                        </a>
                        <a href="https://github.com/wlsdnjswon/vector-ontology-by-backend-RAG" target="_blank" rel="noopener noreferrer" title="GitHub">
                            <Button variant="ghost" size="icon" className="w-9 h-9 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
                                <span className="sr-only">GitHub</span>
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Chat Area */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 p-4 pb-2">
                    {/* 메시지 매핑 (변경 없음) */}
                    {messages.map((message, index) => (
                        <ChatMessage key={index} role={message.role} content={index === currentTypingIndex ? displayedText : message.content} />
                    ))}
                    {/* 로딩 인디케이터 (변경 없음) */}
                    {isLoading && (
                        <div className="flex items-start space-x-3 animate-pulse">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center"><Bot className="h-5 w-5 text-indigo-600" /></div>
                            <div className="p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                                <div className="flex space-x-1 items-center h-5">
                                    <span className="inline-block w-1.5 h-1.5 bg-indigo-400 rounded-full motion-safe:animate-bounce delay-0"></span>
                                    <span className="inline-block w-1.5 h-1.5 bg-indigo-400 rounded-full motion-safe:animate-bounce delay-150"></span>
                                    <span className="inline-block w-1.5 h-1.5 bg-indigo-400 rounded-full motion-safe:animate-bounce delay-300"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggested Questions Area */}
                <div className="flex-shrink-0 px-4 pt-2 pb-2 border-t bg-gray-50/50">
                    <SuggestedQuestions questions={suggestedQuestionsList} onQuestionClick={handleQuestionClick} />
                </div>

                {/* Input Area */}
                <div className="flex items-center space-x-2 p-3 md:p-4 border-t bg-white flex-shrink-0">
                    {/* 입력 필드 및 전송 버튼 (변경 없음) */}
                    <Input ref={inputRef} id="userInput" value={input} onChange={(e) => setInput(e.target.value)} placeholder="질문을 입력하세요..." className="flex-1 text-sm md:text-base" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !isLoading) { e.preventDefault(); handleSendMessage(input); } }} disabled={isLoading} />
                    <Button onClick={() => handleSendMessage(input)} disabled={!input.trim() || isLoading} size="icon" className="w-9 h-9 md:w-10 md:h-10 flex-shrink-0">
                        {isLoading ? (<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-t-2 border-white"></div>) : (<Send className="h-4 w-4 md:h-5 md:w-5" />)}
                    </Button>
                </div>
            </div>
        </main>
    );
}

// app/page.tsx

"use client"

import { useState, useRef, useEffect } from "react"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, ExternalLink, ChevronDown, ChevronUp } from "lucide-react" // 아이콘 추가
import SuggestedQuestions from "@/components/suggested-questions"
import ChatMessage from "@/components/chat-message" // ChatMessage 컴포넌트 임포트

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
        content: "안녕하세요! 온톨로지 기반 지식 챗봇입니다. 무엇이 궁금하신가요?",
        completed: true,
    },
];

// --- Update suggested questions based on your RAG system's capabilities ---
const suggestedQuestionsList = [
    "정진원이 누구인지 자세하게 설명해줘.",
    "SAR 선박 영상의 시멘틱 분할 성능 향상 논문은 무슨 내용이야?",
    "정진원이 받은 상장이 어느 폴더에 있는지 모르겠어. 위치를 찾아줘.",
    "정진원이 받은 특허는 어떤 내용이야?",
];

export default function Home() {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showDevInfo, setShowDevInfo] = useState(false) // 개발자 정보 표시 상태
    const [currentTypingIndex, setCurrentTypingIndex] = useState(-1)
    const [displayedText, setDisplayedText] = useState("")

    const chatContainerRef = useRef<HTMLDivElement>(null)
    const devInfoRef = useRef<HTMLDivElement>(null); // 개발자 정보 드롭다운 참조

    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            const { scrollHeight, clientHeight, scrollTop } = chatContainerRef.current;
            const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 10; // 약간의 여유 추가
            if (scrollHeight > clientHeight && (!isScrolledToBottom || isLoading || currentTypingIndex >= 0)) {
                chatContainerRef.current.scrollTo({ top: scrollHeight, behavior: 'smooth' });
            }
        }
    }, [chatContainerRef, isLoading, currentTypingIndex]); // 의존성 배열 추가

    /*
    // 메시지 변경 시 스크롤 조정
    useEffect(() => {
        // DOM 업데이트 후 스크롤 조정을 위해 약간의 지연 추가
        const scrollTimer = setTimeout(() => {
            scrollToBottom();
        }, 50); // 지연 시간 조정 가능

        return () => clearTimeout(scrollTimer);
    }, [messages]); // messages 배열 자체가 변경될 때만 실행
    */
    useEffect(() => {
        const scrollTimer = setTimeout(() => {
            scrollToBottom(); // 의존성 배열에 추가된 scrollToBottom 호출
        }, 50);

        return () => clearTimeout(scrollTimer);
    }, [messages, scrollToBottom]); // scrollToBottom 추가

    // 타이핑 중 표시되는 텍스트 변경 시 스크롤 조정
    useEffect(() => {
        if (currentTypingIndex >= 0) {
            // 타이핑 중에는 스크롤을 계속 아래로 유지
            const typingScrollTimer = setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
            }, 20); // 타이핑 속도보다 약간 느리게
            return () => clearTimeout(typingScrollTimer);
        }
    }, [displayedText, currentTypingIndex]);
    /*
    // 컴포넌트 마운트 시 스크롤 초기화
    useEffect(() => {
        const initialScrollTimer = setTimeout(() => {
            scrollToBottom();
        }, 100); // 초기 로딩 시간 고려
        return () => clearTimeout(initialScrollTimer);
    }, []);
    */
    useEffect(() => {
        const initialScrollTimer = setTimeout(() => {
            scrollToBottom();
        }, 100);

        return () => clearTimeout(initialScrollTimer);
    }, [scrollToBottom]);
    // --- End of Scroll functions ---

    // --- Typing Effect ---
    useEffect(() => {
        if (currentTypingIndex >= 0 && currentTypingIndex < messages.length) {
            const message = messages[currentTypingIndex];
            // 메시지가 존재하고, assistant 역할이며, 아직 완료되지 않았을 때만 실행
            if (message && !message.completed && message.role === 'assistant') {
                const fullText = message.content;
                const i = displayedText.length;

                if (i < fullText.length) {
                    const typingSpeed = 15; // 타이핑 속도 (글자당 밀리초)
                    const timer = setTimeout(() => {
                        setDisplayedText(fullText.substring(0, i + 1));
                    }, typingSpeed);
                    // 컴포넌트 언마운트 또는 의존성 변경 시 타이머 클리어
                    return () => clearTimeout(timer);
                } else {
                    // 타이핑 완료 처리
                    setMessages(prevMessages => {
                        const updated = [...prevMessages];
                        // 현재 인덱스가 유효한지 다시 확인
                        if (updated[currentTypingIndex]) {
                            updated[currentTypingIndex] = { ...updated[currentTypingIndex], completed: true };
                        }
                        return updated;
                    });
                    // 타이핑 상태 초기화
                    setCurrentTypingIndex(-1);
                    setDisplayedText("");
                }
            } else {
                // 메시지가 사용자 메시지이거나 이미 완료된 경우 타이핑 상태 초기화
                if (currentTypingIndex !== -1) {
                    setCurrentTypingIndex(-1);
                    setDisplayedText("");
                }
            }
        }
    }, [currentTypingIndex, displayedText, messages]); // messages 배열도 의존성에 포함
    // --- End of Typing Effect ---

    // --- 외부 클릭 감지하여 개발자 정보 닫기 ---
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // devInfoRef.current가 존재하고, 클릭된 요소가 드롭다운 내부에 포함되지 않을 때
            if (devInfoRef.current && !devInfoRef.current.contains(event.target as Node)) {
                setShowDevInfo(false); // 드롭다운 닫기
            }
        }
        // 이벤트 리스너 등록
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // 컴포넌트 언마운트 시 리스너 제거
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [devInfoRef]); // ref는 일반적으로 변경되지 않으므로 한 번만 실행됨
    // --- End of 외부 클릭 감지 ---


    // --- 메시지 전송 및 API 호출 함수 ---
    const handleSendMessage = async (message: string) => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || isLoading) return; // 빈 메시지 또는 로딩 중 전송 방지

        const newUserMessage: Message = { role: "user", content: trimmedMessage, completed: true };
        // 이전 메시지 상태를 기반으로 새 메시지 추가 (함수형 업데이트)
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInput(""); // 입력창 비우기
        setIsLoading(true); // 로딩 상태 시작

        try {
            // --- Flask API 호출 ---
            const apiUrl = "http://localhost:5000/chat"; // API 엔드포인트 확인!

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: trimmedMessage }), // 사용자가 입력한 메시지 전송
            });

            setIsLoading(false); // API 응답 후 로딩 상태 해제

            if (!response.ok) {
                // API 오류 처리
                const errorData = await response.json().catch(() => ({ error: "응답 본문 파싱 실패" }));
                console.error("API Error Response:", response.status, errorData);
                setMessages(prev => [...prev, { role: "assistant", content: `오류: ${errorData.error || `서버 응답 코드 ${response.status}`}`, completed: true }]);
                return; // 오류 발생 시 종료
            }

            // --- 성공적인 API 응답 처리 ---
            const data = await response.json();
            // API가 'response' 키를 포함하고 문자열 값을 가지는지 확인
            const assistantResponse = typeof data.response === 'string' ? data.response : "죄송합니다. 유효하지 않은 응답 형식입니다.";

            // 새 어시스턴트 메시지 (타이핑 효과 시작 전)
            const assistantMessagePlaceholder: Message = { role: "assistant", content: assistantResponse, completed: false };
            // 이전 메시지 상태 기반으로 업데이트
            setMessages(prevMessages => [...prevMessages, assistantMessagePlaceholder]);
            setCurrentTypingIndex(messages.length + 1); // 새로 추가될 메시지의 인덱스 설정 (기존 messages 길이 + 1, 0-based index) -> 주의: 상태 업데이트는 비동기! 아래 useEffect에서 messages.length를 사용하는 것이 더 정확할 수 있음.
            setDisplayedText(""); // 타이핑 시작 위해 초기화

        } catch (error) {
            // 네트워크 오류 등 fetch 자체 오류 처리
            console.error("Fetch API Error:", error);
            setIsLoading(false);
            setMessages(prev => [...prev, { role: "assistant", content: "죄송합니다. API 서버 연결에 실패했습니다.", completed: true }]);
        }
    };
    // --- End of handleSendMessage ---

    // currentTypingIndex 설정 시 messages.length를 사용하도록 useEffect 추가 (상태 업데이트 지연 고려)
    useEffect(() => {
        if (messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !messages[messages.length - 1].completed) {
            setCurrentTypingIndex(messages.length - 1);
        }
    }, [messages]);


    // 추천 질문 클릭 핸들러
    const handleQuestionClick = (question: string) => {
        setInput(question); // 입력창에 질문 채우기
        // 포커스를 입력창으로 이동시켜 사용자가 바로 전송하거나 수정할 수 있게 함
        const inputElement = document.getElementById("userInput") as HTMLInputElement | null;
        if (inputElement) {
            inputElement.focus();
        }
        // 선택적으로 클릭 시 바로 전송하고 싶으면 아래 주석 해제
        // handleSendMessage(question);
    };

    // --- JSX 렌더링 ---
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-12 lg:p-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="z-10 w-full max-w-3xl flex flex-col h-[90vh] md:h-[85vh] bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden">
                {/* Header Section */}
                <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
                    <div className="flex items-center">
                        <Bot className="h-7 w-7 md:h-8 md:w-8 mr-2 text-indigo-600" />
                        <h1 className="text-lg md:text-xl font-semibold text-gray-800">온톨로지 RAG 챗봇</h1>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-3">
                        {/* 개발자 정보 버튼 및 드롭다운 */}
                        <div className="relative" ref={devInfoRef}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center space-x-1 text-xs md:text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md px-2 py-1"
                                onClick={() => setShowDevInfo(prev => !prev)}
                            >
                                <User className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                <span className="hidden sm:inline">개발자 정보</span>
                                {showDevInfo ? <ChevronUp className="h-3 w-3 md:h-4 md:w-4 ml-1 flex-shrink-0" /> : <ChevronDown className="h-3 w-3 md:h-4 md:w-4 ml-1 flex-shrink-0" />}
                            </Button>

                            {showDevInfo && (
                                <div className="absolute right-0 mt-2 w-60 md:w-64 bg-white rounded-md shadow-lg p-4 z-20 border text-xs md:text-sm animate-in fade-in duration-150">
                                    <h3 className="font-semibold text-gray-900 mb-2">챗봇 정보</h3>
                                    <p className="text-gray-700 mb-1">이름: 정진원</p>
                                    <p className="text-gray-700 mb-1">연락처: 010-7352-5435</p>
                                    <p className="text-gray-700 mb-1">이메일: <a href="mailto:wlsdnjswon@gmail.com" className="text-indigo-600 hover:underline">wlsdnjswon@gmail.com</a></p>
                                    <p className="text-gray-500 text-xs mt-3 pt-2 border-t">© 2024 RAG Chat</p>
                                </div>
                            )}
                        </div>

                        {/* Google Scholar 링크 */}
                        <a href="https://scholar.google.co.kr/citations?user=H8Fz07YAAAAJ&hl=ko&authuser=1/" target="_blank" rel="noopener noreferrer" title="Google Scholar">
                            <Button variant="outline" size="sm" className="flex items-center space-x-1 text-xs md:text-sm px-2 py-1">
                                <span className="hidden sm:inline">Google Scholar</span>
                                <span className="sm:hidden">Scholar</span>
                                <ExternalLink className="h-3 w-3 md:h-4 md:w-4 ml-1 flex-shrink-0" />
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Chat Area */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 p-4">
                    {messages.map((message, index) => (
                        <ChatMessage
                            key={index} // key는 고유해야 함
                            role={message.role}
                            content={index === currentTypingIndex ? displayedText : message.content}
                        />
                    ))}
                    {/* 로딩 상태는 이제 ChatMessage 내부에서 빈 메시지 + 애니메이션으로 처리됨 */}
                </div>

                {/* Suggested Questions Area - 항상 표시 */}
                <div className="px-4 pt-2 pb-4 border-t bg-gray-50/50">
                    <SuggestedQuestions questions={suggestedQuestionsList} onQuestionClick={handleQuestionClick} />
                </div>

                {/* Input Area */}
                <div className="flex items-center space-x-2 p-3 md:p-4 border-t bg-white sticky bottom-0 z-10">
                    <Input
                        id="userInput" // 포커스를 위한 ID 추가
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="질문을 입력하세요..."
                        className="flex-1 text-sm md:text-base"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                                e.preventDefault();
                                handleSendMessage(input);
                            }
                        }}
                        disabled={isLoading}
                    />
                    <Button onClick={() => handleSendMessage(input)} disabled={!input.trim() || isLoading} size="icon" className="w-9 h-9 md:w-10 md:h-10">
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-t-2 border-white"></div>
                        ) : (
                            <Send className="h-4 w-4 md:h-5 md:w-5" />
                        )}
                    </Button>
                </div>
            </div>
        </main>
    );
}
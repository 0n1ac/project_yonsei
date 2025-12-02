"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Bot, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: string;
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageItem = ({ m }: { m: Message }) => {
  // ✨ [수정 1] AI 메시지('assistant')는 절대 접지 않음. (유저/시스템 메시지만 접음)
  const isLongMessage = m.content.length > 300 && m.role !== "assistant";
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={clsx(
      "max-w-[85%] sm:max-w-[90%] md:max-w-2xl p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm backdrop-blur-sm border transition-all duration-300 relative",
      m.role === "user"
        ? "bg-blue-600/90 text-white border-blue-500 rounded-tr-none"
        : m.role === "system"
          ? "bg-gray-100/50 text-gray-600 text-[10px] sm:text-xs py-0.5 sm:py-1 px-2 sm:px-3 border-transparent rounded-full mx-auto"
          : "bg-white/80 text-gray-800 border-white/50 rounded-tl-none shadow-md"
    )}>
      {m.role === "assistant" && (
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 opacity-50 border-b border-gray-200/50 pb-0.5 sm:pb-1">
          <Bot size={10} className="sm:w-3 sm:h-3" />
          <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">AI Assistant</span>
        </div>
      )}

      {/* 본문 영역 */}
      <div className={clsx(
        "prose prose-xs sm:prose-sm max-w-none break-words",
        m.role === "user" ? "text-white prose-invert" : "text-gray-800",
        // 접혔을 때 높이 제한
        (!isExpanded && isLongMessage) && "max-h-[120px] sm:max-h-[140px] overflow-hidden"
      )}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 mb-2 space-y-1" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 mb-2 space-y-1" {...props} />,
            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
            h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-4 mb-2 border-b pb-1" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-3 mb-2" {...props} />,
            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-3 py-1 my-2 italic bg-gray-50/50 rounded-r text-gray-600" {...props} />,
            code: ({ node, ...props }) => <code className="bg-gray-100 text-red-500 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
            pre: ({ node, ...props }) => <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto my-2 text-xs" {...props} />,
            a: ({ node, ...props }) => <a className="text-blue-200 hover:text-white underline break-all" target="_blank" rel="noopener noreferrer" {...props} />, // 링크 색상 조정
            table: ({ node, ...props }) => <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-gray-200 border text-xs" {...props} /></div>,
            th: ({ node, ...props }) => <th className="bg-gray-50 px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider border-b" {...props} />,
            td: ({ node, ...props }) => <td className="px-3 py-2 whitespace-nowrap border-b text-gray-600" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
          }}
        >
          {m.content}
        </ReactMarkdown>
      </div>

      {/* ✨ [수정 2] 그라데이션 오버레이 디자인 개선 */}
      {(!isExpanded && isLongMessage) && (
        <div className={clsx(
          "absolute bottom-0 left-0 w-full h-24 pointer-events-none rounded-b-2xl",
          // 유저(파랑)일 때는 파란색 그라데이션, 아닐 땐 흰색 그라데이션 적용
          m.role === "user"
            ? "bg-gradient-to-t from-blue-600 via-blue-600/80 to-transparent"
            : "bg-gradient-to-t from-white via-white/80 to-transparent"
        )} />
      )}

      {/* 더 보기 버튼 */}
      {isLongMessage && (
        <div className="relative z-10 mt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={clsx(
              "text-xs font-bold flex items-center justify-center gap-1 transition-colors w-full py-1.5 rounded-lg backdrop-blur-sm",
              m.role === "user"
                ? "text-blue-100 hover:text-white bg-blue-700/20 hover:bg-blue-700/40"
                : "text-gray-500 hover:text-blue-600 bg-gray-100/50 hover:bg-gray-100"
            )}
          >
            {isExpanded ? (
              <>접기 <ChevronUp size={12} /></>
            ) : (
              <>더 보기 <ChevronDown size={12} /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <main className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4 scroll-smooth scrollbar-hide">
      {messages.map((m, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={clsx(
            "flex w-full",
            m.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <MessageItem m={m} />
        </motion.div>
      ))}

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full justify-start"
        >
          <div className="bg-white/70 border border-white/50 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl rounded-tl-none shadow-sm flex items-center gap-0.5 sm:gap-1">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></span>
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </main>
  );
}
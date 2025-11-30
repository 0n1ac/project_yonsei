"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Palette } from "lucide-react"; // 팔레트 아이콘
import { clsx } from "clsx";
import AgentDock from "./components/AgentDock";
import ChatWindow from "./components/ChatWindow";
import InputArea from "./components/InputArea";
import FloatingHome from "./components/FloatingHome";
import { agents } from "./data/agents";

// ✨ 4. 테마 정의 (Tailwind Gradients)
const themes = [
  { id: "default", name: "Yonsei Blue", class: "from-blue-100 via-indigo-50 to-purple-100", dot: "bg-blue-500" },
  { id: "sunset", name: "Songdo Sunset", class: "from-orange-100 via-rose-50 to-pink-100", dot: "bg-orange-500" },
  { id: "forest", name: "Central Park", class: "from-green-100 via-emerald-50 to-teal-100", dot: "bg-green-500" },
  { id: "night", name: "Campus Night", class: "from-gray-900 via-slate-800 to-blue-900", dot: "bg-slate-700" }, // 다크모드 느낌
];

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(agents[0]);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✨ 테마 상태
  const [currentTheme, setCurrentTheme] = useState(themes[0]);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const handleAgentChange = (agent: any) => {
    setCurrentAgent(agent);
    setMessages(prev => [
      ...prev,
      { role: "system", content: `${agent.name}님으로 전환되었습니다.` }
    ]);
  };

  const handleStart = (agent: any) => {
    setCurrentAgent(agent);
    setIsStarted(true);
    setMessages([
      { role: "assistant", content: `안녕하세요! ${agent.role} ${agent.name}입니다. ${agent.desc}` }
    ]);
  };

  const sendMessageToAI = async (newMessages: any[]) => {
    setIsLoading(true); // ✨ 로딩 시작
    try {
      const apiMessages = newMessages.filter(m => m.role !== "system");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          currentAgent,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: "assistant", content: aiResponse };
          return newMsgs;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "죄송합니다. 오류가 발생했습니다." }
      ]);
    } finally {
      setIsLoading(false); // ✨ 로딩 끝
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    sendMessageToAI(newMessages);
  };

  const append = async (message: { role: string; content: string }) => {
    const newMessages = [...messages, message];
    setMessages(newMessages);
    await sendMessageToAI(newMessages);
  };

  return (
    // ✨ 배경에 currentTheme.class 적용
    <div className={clsx(
      "min-h-screen bg-gradient-to-br flex items-center justify-center p-0 md:p-6 font-sans transition-colors duration-500 ease-in-out",
      currentTheme.class
    )}>

      {/* ✨ 테마 변경 버튼 (우측 상단) */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setShowThemePicker(!showThemePicker)}
          className="p-3 bg-white/40 backdrop-blur-md rounded-full shadow-lg hover:bg-white/60 transition-all border border-white/50 text-gray-600"
        >
          <Palette size={20} />
        </button>

        <AnimatePresence>
          {showThemePicker && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="absolute right-0 mt-2 p-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 w-48 flex flex-col gap-2"
            >
              <p className="text-xs font-bold text-gray-500 mb-1 px-1">테마 선택</p>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setCurrentTheme(t);
                    setShowThemePicker(false);
                  }}
                  className={clsx(
                    "flex items-center gap-3 p-2 rounded-xl text-sm font-medium transition-all",
                    currentTheme.id === t.id ? "bg-white shadow-sm ring-1 ring-gray-200" : "hover:bg-white/50"
                  )}
                >
                  <div className={clsx("w-6 h-6 rounded-full shadow-inner", t.dot)} />
                  <span className="text-gray-700">{t.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full h-full md:h-[92vh] md:max-w-5xl bg-white/30 backdrop-blur-xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/40 relative transition-all duration-300">
        <AnimatePresence mode="wait">
          {!isStarted ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              className="w-full h-full"
            >
              <FloatingHome onStart={handleStart} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col h-full w-full"
            >
              <AgentDock
                currentAgent={currentAgent}
                onAgentChange={handleAgentChange}
              />

              <ChatWindow
                messages={messages}
                isLoading={isLoading} // ✨ ChatWindow에 로딩 상태 전달
              />

              <InputArea
                currentAgent={currentAgent}
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                append={append}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
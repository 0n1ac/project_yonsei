"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RefreshCw, Trash2, Utensils, MapPin, Mail, PenTool } from "lucide-react";
import { clsx } from "clsx";
import { saveLearnUsUrl, getStoredAuth, fetchSchedule } from "../utils/planner";
import { fetchTodayMenu } from "../utils/menuScraper";
import AssignmentCheckModal from "./AssignmentCheckModal";

interface InputAreaProps {
  currentAgent: any;
  input: string;
  setInput: (val: string) => void;
  onSubmit: (e: any) => void;
  append: (message: { role: "user"; content: string }) => Promise<any>;
}

export default function InputArea({ currentAgent, input, setInput, onSubmit, append }: InputAreaProps) {
  // === 공통 상태 ===
  const [plannerUrl, setPlannerUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSchedule, setTempSchedule] = useState<any[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);

  // 이메일 상태
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSituation, setEmailSituation] = useState("출석 인정 (유고 결석)");
  const [emailReason, setEmailReason] = useState("");

  useEffect(() => {
    if (getStoredAuth()) setIsConnected(true);
  }, []);

  // --- 플래너 핸들러 ---
  const handleConnect = () => {
    if (saveLearnUsUrl(plannerUrl)) {
      setIsConnected(true);
      handleFetchOnly();
    } else {
      alert("올바른 LearnUs 내보내기 URL이 아닙니다.");
    }
  };

  const handleDisconnect = () => {
    if (window.confirm("LearnUs 연동을 해제하시겠습니까?")) {
      localStorage.removeItem("learnus_auth");
      setIsConnected(false);
      setPlannerUrl("");
    }
  };

  const handleFetchOnly = async () => {
    setIsLoading(true);
    try {
      const schedule = await fetchSchedule();
      setTempSchedule(schedule);
      setIsModalOpen(true);
    } catch (e) {
      if (confirm("일정을 가져오는데 실패했습니다. URL이 만료되었을 수 있습니다. 재연동 하시겠습니까?")) {
        handleDisconnect();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSync = async (finalData: any[]) => {
    setIsModalOpen(false);
    const aiPrompt = `[시스템: 일정 데이터 로드됨] 학정번호와 마감일을 분석해 학습 계획을 짜줘.\n데이터: ${JSON.stringify(finalData)}`;
    setInput("");
    await append({ role: "user", content: aiPrompt });
  };

  // --- 맛잘알 핸들러 ---
  const handleCafeteriaCheck = async () => {
    setIsMenuLoading(true);
    try {
      const menuText = await fetchTodayMenu();
      const aiPrompt = `[시스템: 학식 데이터 로드됨] 오늘 식단:\n${menuText}\n\n메뉴를 요약하고 추천해줘.`;
      setInput("");
      await append({ role: "user", content: aiPrompt });
    } catch (e) {
      alert("메뉴를 불러오는데 실패했습니다.");
    } finally {
      setIsMenuLoading(false);
    }
  };

  const handleRecommendRestaurant = () => {
    setInput(`[시스템: 맛집 추천 요청] 송도 캠퍼스 근처(트리플, 캠타) 맛집 추천해줘.`);
  };

  // --- 이메일 작성 핸들러 ---
  const handleDraftEmail = () => {
    if (!emailRecipient.trim() || !emailReason.trim()) {
      alert("받는 분 성함과 내용을 입력해주세요!");
      return;
    }
    const aiPrompt = `[시스템: 이메일 초안 작성 요청]\n- 받는 분: ${emailRecipient} 교수님\n- 상황: ${emailSituation}\n- 핵심 내용: ${emailReason}\n\n조건: 제목, 정중한 인사, 극존칭 사용.`;
    setInput(aiPrompt);
  };

  const handleDebugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(e);
  };

  return (
    <>
      <AssignmentCheckModal 
        isOpen={isModalOpen}
        initialData={tempSchedule}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleFinalSync}
      />

      <div className="bg-white/40 backdrop-blur-md border-t border-white/20 p-4 pb-6 relative z-30">
        <AnimatePresence mode="wait">
          
          {/* 1. 플래너 위젯 */}
          {currentAgent.id === 'planner' && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 10 }}
              className="mb-3 p-4 bg-white/80 rounded-xl border border-purple-200 text-sm shadow-sm backdrop-blur-sm"
            >
              <p className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                <currentAgent.icon size={16} /> J형 조교의 일정 관리
              </p>
              {!isConnected ? (
                <div className="flex gap-2">
                  <input 
                    value={plannerUrl}
                    onChange={(e) => setPlannerUrl(e.target.value)}
                    placeholder="LearnUs 캘린더 URL"
                    className="flex-1 p-2 border border-purple-200 rounded-lg text-xs focus:outline-purple-500 placeholder-purple-400/70 text-gray-900"
                  />
                  <button onClick={handleConnect} className="bg-purple-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-purple-700">연동</button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-purple-700 text-xs font-medium flex items-center gap-1">
                    ✅ LearnUs 연결됨 
                    <button onClick={handleDisconnect} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={12} /></button>
                  </span>
                  <button onClick={handleFetchOnly} disabled={isLoading} className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-purple-200">
                    <RefreshCw size={14} className={clsx(isLoading && "animate-spin")} /> {isLoading ? "로딩..." : "일정 가져오기"}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* 2. 맛잘알 위젯 */}
          {currentAgent.id === 'menu' && (
             <motion.div 
             initial={{ opacity: 0, height: 0, y: 10 }}
             animate={{ opacity: 1, height: 'auto', y: 0 }}
             exit={{ opacity: 0, height: 0, y: 10 }}
             className="mb-3 p-4 bg-white/80 rounded-xl border border-orange-200 text-sm shadow-sm backdrop-blur-sm"
           >
              <p className="font-bold text-orange-900 mb-2 flex items-center gap-2">
               <currentAgent.icon size={16} /> 오늘 뭐 먹지?
             </p>
             <div className="flex gap-2">
                <button onClick={handleCafeteriaCheck} disabled={isMenuLoading} className="flex-1 bg-orange-100 text-orange-700 py-3 rounded-lg font-bold hover:bg-orange-200 flex items-center justify-center gap-2">
                  {isMenuLoading ? <RefreshCw size={16} className="animate-spin"/> : <Utensils size={16} />} 오늘의 학식
                </button>
                <button onClick={handleRecommendRestaurant} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 flex items-center justify-center gap-2">
                  <MapPin size={16} /> 맛집 추천
                </button>
             </div>
           </motion.div>
          )}

          {/* 3. 이메일 위젯 */}
          {currentAgent.id === 'email' && (
             <motion.div 
             initial={{ opacity: 0, height: 0, y: 10 }}
             animate={{ opacity: 1, height: 'auto', y: 0 }}
             exit={{ opacity: 0, height: 0, y: 10 }}
             className="mb-3 p-4 bg-white/80 rounded-xl border border-green-200 text-sm shadow-sm backdrop-blur-sm flex flex-col gap-3"
           >
              <p className="font-bold text-green-900 flex items-center gap-2">
               <currentAgent.icon size={16} /> 이메일 비서
             </p>
             
             <div className="grid grid-cols-2 gap-2">
               <input 
                 value={emailRecipient}
                 onChange={(e) => setEmailRecipient(e.target.value)}
                 placeholder="교수님 성함 (예: 김연세)"
                 className="p-2 border border-green-200 rounded-lg text-xs focus:outline-green-500 placeholder-green-500/70 text-gray-900 bg-white/90"
               />
               <select 
                 value={emailSituation}
                 onChange={(e) => setEmailSituation(e.target.value)}
                 className="p-2 border border-green-200 rounded-lg text-xs focus:outline-green-500 bg-white/90 text-gray-900"
               >
                 <option>출석 인정 (유고 결석)</option> <option>성적 정정/확인 문의</option> <option>면담/상담 요청</option> <option>강의 관련 질문</option> <option>과제 제출 지연 사유</option>
               </select>
             </div>
             
             <textarea 
               value={emailReason}
               onChange={(e) => setEmailReason(e.target.value)}
               placeholder="구체적인 사유나 용건을 적어주세요."
               className="p-2 border border-green-200 rounded-lg text-xs focus:outline-green-500 resize-none h-16 placeholder-green-500/70 text-gray-900 bg-white/90"
             />

             <button 
                onClick={handleDraftEmail}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md"
             >
               <PenTool size={14} /> 초안 작성하기
             </button>
           </motion.div>
          )}

          {/* ✨ 4. 송도 고인물 위젯 */}
          {currentAgent.id === 'local' && (
             <motion.div 
               initial={{ opacity: 0, height: 0, y: 10 }} 
               animate={{ opacity: 1, height: 'auto', y: 0 }} 
               exit={{ opacity: 0, height: 0, y: 10 }} 
               className="mb-3 p-4 bg-white/80 rounded-xl border border-teal-200 text-sm shadow-sm backdrop-blur-sm flex flex-col gap-3"
             >
              <p className="font-bold text-teal-900 flex items-center gap-2">
                <currentAgent.icon size={16} /> 송도 고인물
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setInput("기숙사 배달 어디서 받아야 해?")} className="bg-teal-50 text-teal-700 p-2 rounded-lg text-xs hover:bg-teal-100 text-left">🛵 배달 수령 위치?</button>
                <button onClick={() => setInput("일반쓰레기랑 음식물 어디다 버려?")} className="bg-teal-50 text-teal-700 p-2 rounded-lg text-xs hover:bg-teal-100 text-left">🗑️ 쓰레기 배출 방법?</button>
                <button onClick={() => setInput("지금 프린트 할 수 있는 곳 있어?")} className="bg-teal-50 text-teal-700 p-2 rounded-lg text-xs hover:bg-teal-100 text-left">🖨️ 프린트 위치</button>
                <button onClick={() => setInput("근처 약국이나 병원 어디야?")} className="bg-teal-50 text-teal-700 p-2 rounded-lg text-xs hover:bg-teal-100 text-left">💊 약국/병원 위치</button>
              </div>
           </motion.div>
          )}

        </AnimatePresence>

        <form onSubmit={handleDebugSubmit} className="flex gap-2 items-center relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${currentAgent.name}에게 질문하기...`}
            className="w-full p-4 bg-white/70 backdrop-blur-sm rounded-2xl text-sm border border-white/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/90 transition-all pl-5 placeholder-gray-500 text-gray-900"
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className={clsx(
              "p-4 rounded-2xl text-white shadow-lg flex items-center justify-center backdrop-blur-sm",
              currentAgent.color
            )}
          >
            <Send size={20} />
          </motion.button>
        </form>
      </div>
    </>
  );
}
"use client";

import { motion } from "framer-motion";
import { agents } from "../data/agents";

interface FloatingHomeProps {
  onStart: (agent: any) => void;
}

export default function FloatingHome({ onStart }: FloatingHomeProps) {
  const totalAgents = agents.length;

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">

      {/* 1. 중앙 타이틀 - 모바일 최적화 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="absolute z-0 top-1/2 left-1/2 w-full flex flex-col items-center justify-center text-center px-4 py-6 pointer-events-none"
      >
        <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-gray-800 mb-2 md:mb-3 tracking-tight">
          <span className="text-blue-600">Yonsei</span>-Navi
        </h1>
        <p className="text-gray-500 text-[11px] sm:text-sm md:text-base font-medium">
          AI 선배 선택하기
        </p>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-48 bg-blue-100/50 rounded-full blur-2xl -z-10 animate-pulse" />
      </motion.div>

      {/* 2. 에이전트 영역 - 모바일 안전 반지름 */}
      <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        {agents.map((agent, index) => {
          const angle = (index / totalAgents) * 360 - 90;

          // ✨ [수정됨] Math.random() 제거 -> index 기반의 고정된 값 사용
          // 예: index가 0이면 3초, 1이면 3.5초... (서버/클라이언트 동일)
          const floatDuration = 3 + (index % 3) * 0.5;
          const floatDelay = index * 0.2;

          return (
            <div
              key={agent.id}
              className="absolute flex items-center justify-center pointer-events-auto [--radius:110px] sm:[--radius:150px] md:[--radius:220px]"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(var(--radius)) rotate(${-angle}deg)`
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.5 + index * 0.1,
                  type: "spring", stiffness: 200, damping: 20
                }}
              >
                <motion.button
                  onClick={() => onStart(agent)}
                  // 둥둥 떠다니는 효과
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: floatDuration, // ✨ 고정된 시간 사용
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: floatDelay // ✨ 고정된 딜레이 사용
                  }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center group outline-none touch-manipulation"
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white shadow-2xl ${agent.color} ring-3 sm:ring-4 ring-white/50 backdrop-blur-md relative transition-all duration-300 group-hover:ring-blue-300/80 group-hover:shadow-blue-200/50 group-active:scale-95`}>
                    <agent.icon size={20} className="sm:w-7 sm:h-7 md:w-9 md:h-9" />
                    <div className="absolute inset-0 rounded-full bg-white/30 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="mt-1.5 sm:mt-2 bg-white/80 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/60 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
                    <span className="text-[10px] sm:text-xs font-bold text-gray-800 whitespace-nowrap">{agent.role}</span>
                  </div>
                </motion.button>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* 3. 배경 장식 - 모바일 축소 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-blue-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[20%] right-[20%] w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
    </div>
  );
}
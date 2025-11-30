"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { agents } from "../data/agents";

interface AgentDockProps {
  currentAgent: any;
  onAgentChange: (agent: any) => void;
}

export default function AgentDock({ currentAgent, onAgentChange }: AgentDockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <header className="relative z-20 w-full flex justify-center py-4 bg-white/40 backdrop-blur-md border-b border-white/20 shadow-sm transition-all">
      <div className="flex gap-2 items-end h-24 px-4">
        {agents.map((agent, index) => {
          const isSelected = currentAgent.id === agent.id;
          
          let scale = 1;
          let translateY = 0;

          if (hoveredIndex !== null) {
            const distance = Math.abs(hoveredIndex - index);
            if (distance === 0) {
              scale = 1.35;
              translateY = -10;
            } else if (distance === 1) {
              scale = 1.15;
              translateY = -5;
            } else {
              scale = 0.9;
            }
          } else {
            if (isSelected) scale = 1.1; 
          }

          return (
            <div key={agent.id} className="relative flex flex-col items-center">
              <button
                onClick={() => onAgentChange(agent)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex flex-col items-center flex-shrink-0 outline-none transition-all duration-200"
                style={{ width: '64px' }}
              >
                <motion.div
                  animate={{ scale, y: translateY }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.8 }}
                  className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg relative z-10 backdrop-blur-sm",
                    agent.color,
                    isSelected ? "ring-4 ring-white/60 ring-offset-2 ring-offset-transparent" : "opacity-80 hover:opacity-100"
                  )}
                >
                  <agent.icon size={22} />
                </motion.div>
              </button>

              {/* ✨ 툴팁 (Hover 시 등장) */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 20, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    className="absolute top-14 w-40 p-2 bg-gray-900/80 backdrop-blur-md text-white text-xs text-center rounded-lg shadow-xl z-50 pointer-events-none"
                  >
                    <p className="font-bold mb-1 text-yellow-300">{agent.role}</p>
                    <p className="text-gray-200 font-light">{agent.desc}</p>
                    {/* 말풍선 꼬리 */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/80 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </header>
  );
}
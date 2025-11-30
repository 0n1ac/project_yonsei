"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, AlertCircle, Calendar } from "lucide-react";
import { clsx } from "clsx";

interface Item {
  title: string;
  date: string;
  courseCode: string | null;
  desc: string;
}

interface ModalItem extends Item {
  isEditing: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (finalData: Item[]) => void;
  initialData: Item[];
}

export default function AssignmentCheckModal({ isOpen, onClose, onConfirm, initialData }: Props) {
  const [items, setItems] = useState<ModalItem[]>([]);

  useEffect(() => {
    const initializedData = initialData.map(item => ({
      ...item,
      isEditing: !item.courseCode 
    }));
    setItems(initializedData);
  }, [initialData]);

  const handleCodeChange = (index: number, newCode: string) => {
    const newItems = [...items];
    newItems[index].courseCode = newCode;
    setItems(newItems);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-lg rounded-[2rem] overflow-hidden flex flex-col max-h-[85vh] shadow-2xl border border-white/40 bg-white/80 backdrop-blur-xl ring-1 ring-white/50"
      >
        {/* 헤더 */}
        <div className="p-5 border-b border-white/30 flex justify-between items-center bg-white/40 backdrop-blur-md">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
            <Calendar className="text-blue-600" size={20}/>
            일정 확인 및 수정
            <span className="text-xs font-bold text-blue-600 bg-blue-100/50 px-2 py-1 rounded-full border border-blue-200">
              {items.length}건
            </span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* 리스트 영역 */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1 scrollbar-hide">
          {items.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
               <AlertCircle size={32} className="opacity-50"/>
               <p className="text-sm">가져온 일정이 없습니다.</p>
             </div>
          ) : (
            items.map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white/50 hover:bg-white/80 p-4 rounded-2xl border border-white/60 shadow-sm transition-all duration-200 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start gap-3">
                  <span className="font-semibold text-gray-800 text-sm leading-snug break-keep flex-1">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm whitespace-nowrap">
                    {item.date}
                  </span>
                </div>
                
                {/* 학정번호 입력 영역 */}
                <div className="flex items-center gap-2 mt-1">
                  {!item.isEditing ? (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1.5 shadow-sm">
                      <Check size={12} /> {item.courseCode}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 bg-red-50/50 p-1.5 rounded-lg border border-red-100/50 transition-colors focus-within:bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
                      <span className="text-[10px] text-red-500 flex items-center gap-1 font-bold whitespace-nowrap pl-1">
                        코드입력
                      </span>
                      <input 
                        type="text"
                        value={item.courseCode || ""} 
                        placeholder="예: CSI2101"
                        // ✨ placeholder-gray-500 변경
                        className="text-xs p-1 bg-transparent focus:outline-none w-full font-medium text-gray-900 placeholder-gray-500"
                        onChange={(e) => handleCodeChange(idx, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-white/30 bg-white/40 backdrop-blur-md flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-white/50 rounded-xl transition-all"
          >
            취소
          </button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                const cleanData = items.map(({ isEditing, ...rest }) => rest);
                onConfirm(cleanData);
            }}
            className="px-5 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all flex items-center gap-2"
          >
            <span>분석 시작하기</span>
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <Check size={12} />
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
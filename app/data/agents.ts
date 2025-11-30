import { Calendar, Utensils, Mail, Lightbulb, Bot } from "lucide-react"; // ✨ Bus 삭제, Lightbulb 추가

export const agents = [
  { 
    id: "general", 
    name: "연세-Navi", 
    role: "메인 비서", 
    icon: Bot, 
    color: "bg-blue-600",
    desc: "무엇이든 물어보세요!" 
  },
  { 
    id: "planner", 
    name: "J형 조교", 
    role: "일정/과제", 
    icon: Calendar, 
    color: "bg-purple-600",
    desc: "ICS 파일로 일정을 분석해드려요." 
  },
  { 
    id: "menu", 
    name: "맛잘알", 
    role: "학식/맛집", 
    icon: Utensils, 
    color: "bg-orange-500",
    desc: "오늘 학식과 송도 맛집 추천!" 
  },
  { 
    id: "email", 
    name: "예절 1타", 
    role: "이메일 작성", 
    icon: Mail, 
    color: "bg-green-600",
    desc: "교수님께 보낼 메일 초안 작성." 
  },
  // ✨ 버스 -> 아이디어 뱅크로 교체
  { 
    id: "idea", 
    name: "아이디어 뱅크", 
    role: "과제/팀플", 
    icon: Lightbulb, 
    color: "bg-yellow-500",
    desc: "막막한 과제 주제와 목차를 잡아드려요." 
  }
];
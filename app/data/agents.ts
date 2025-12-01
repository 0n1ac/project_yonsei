import { Calendar, Utensils, Mail, Map } from "lucide-react";

export const agents = [
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
  { 
    id: "local", 
    name: "송도 고인물", 
    role: "생활/꿀팁", 
    icon: Map, 
    color: "bg-teal-600",
    desc: "배달존, 시설 위치 등 송도만의 꿀팁을 알려드려요." 
  }
];
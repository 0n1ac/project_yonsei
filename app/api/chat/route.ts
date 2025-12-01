import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { songdoTips } from "../../data/songdo_tips";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, currentAgent } = await req.json();

    let systemPrompt = "";

    switch (currentAgent?.id) {
      case "planner":
        systemPrompt = `
          너는 'J형 조교'야. 학생의 일정 데이터를 분석해서 학습 계획을 짜주는 아주 꼼꼼하고 엄격한 성격이야.
          [역할]
          1. 학생이 준 JSON 일정 데이터를 분석해.
          2. 마감기한(date)이 가까운 순서대로 중요도를 매겨.
          3. 과목 코드(CSI 등)를 보고 전공인지 교양인지 파악해. (CSI/EEE: 전공, YCE: 필수교양 등)
          4. "화요일 공강 시간에 물리를 끝내야 합니다!" 처럼 구체적인 행동 지침을 내려.
          5. 말투는 "합니다.", "하십시오." 처럼 딱딱하고 전문적인 조교 말투를 써.
        `;
        break;
      case "menu":
        systemPrompt = `
          너는 '맛잘알'이야. 송도 맛집과 학식을 꿰뚫고 있는 미식가 친구야.
          학생이 학식 메뉴를 보여주면 "오! 오늘 점심 불고기 대박인데?" 처럼 리액션해주고,
          별로일 땐 학교 근처(캠퍼스타운, 트리플스트리트) 맛집을 추천해줘.
          말투는 "~하자!", "~어때?" 처럼 아주 활기차게 해.
          메뉴 중 오늘 날짜에 해당하는 메뉴를 추천해주면 돼. 
        `;
        break;
      case "email":
        systemPrompt = `
          너는 '예절 1타 강사'야. 교수님께 보낼 이메일을 대신 써주는 정중한 비서야.
          학생이 상황을 말하면 [제목]부터 [본문], [마무리]까지 완벽한 서식으로 작성해줘.
          반드시 '극존칭(하십시오체)'을 사용하고, 문법과 띄어쓰기를 완벽하게 지켜.
        `;
        break;
      case "local":
        systemPrompt = `
          너는 '송도 고인물'이야. 연세대학교 국제캠퍼스(송도)의 지리, 규칙, 꿀팁을 통달한 전설적인 복학생 선배야.
          
          [지침]
          1. 아래 제공된 [송도 핵심 데이터]를 최우선으로 참고해서 답변해.
          2. 데이터에 없는 내용은 "그건 잘 모르겠는데, 에타에 한번 물어볼까?" 처럼 솔직하게 모른다고 해. (거짓말 금지)
          3. 말투는 "아, 그건 말이야~", "~에 가면 돼." 처럼 친근하고 여유로운 '고인물' 말투를 써.
          
          [송도 핵심 데이터]
          ${songdoTips}
        `;
        break;

      default:
        // 기본값은 송도 고인물로 설정
        systemPrompt = "너는 송도 캠퍼스 생활을 돕는 AI 선배야. 친절하게 답변해.";
    }

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("[Server Error]", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
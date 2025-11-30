import ICAL from "ical.js";

export const saveLearnUsUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const userid = urlObj.searchParams.get("userid");
    const authtoken = urlObj.searchParams.get("authtoken");

    if (!userid || !authtoken) throw new Error("유효한 URL이 아닙니다.");

    const authData = { userid, authtoken };
    localStorage.setItem("learnus_auth", JSON.stringify(authData));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getStoredAuth = () => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("learnus_auth");
  return data ? JSON.parse(data) : null;
};

// ✨ [New] 무조건 날짜를 만들어내는 함수
const forceParseDate = (val: any) => {
  if (!val) return null;

  try {
    // 1. ical.js Time 객체인 경우 (가장 이상적)
    if (val.toJSDate) {
      return val.toJSDate();
    }

    // 2. 무엇이 들어오든 일단 문자열로 변환
    const strVal = String(val);

    // 3. YYYYMMDD 패턴 찾기 (시간 무시, 날짜만 추출)
    // 예: "20251130T150000Z" -> "2025", "11", "30"
    const match = /(\d{4})(\d{2})(\d{2})/.exec(strVal);
    
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1; // JS 월은 0부터 시작
      const day = parseInt(match[3]);
      return new Date(year, month, day);
    }
    
    return null;
  } catch (e) {
    return null;
  }
};

export const fetchSchedule = async () => {
  const auth = getStoredAuth();
  if (!auth) throw new Error("연동 정보가 없습니다.");

  const targetUrl = `/api/proxy-calendar?userid=${auth.userid}&authtoken=${auth.authtoken}`;
  console.log(`[Planner] 프록시 요청 시작: ${targetUrl}`);

  const res = await fetch(targetUrl);
  if (!res.ok) throw new Error(`서버 에러: ${res.status}`);

  const icsText = await res.text();
  
  if (icsText.trim().startsWith("<") || icsText.includes("<!DOCTYPE html>")) {
    throw new Error("LearnUs 인증이 만료되었습니다. 다시 연동해주세요.");
  }

  console.log(`[Planner] 데이터 수신 성공 (길이: ${icsText.length})`);
  
  try {
    const jcalData = ICAL.parse(icsText);
    const comp = new ICAL.Component(jcalData);

    const events = comp.getAllSubcomponents("vevent");
    
    console.log(`[Planner] 이벤트 발견: ${events.length}개`);

    // ✨ 디버깅: 첫 번째 이벤트가 어떻게 생겼는지 확인
    if (events.length > 0) {
      const first = events[0];
      const dtstart = first.getFirstPropertyValue("dtstart");
      console.log("[Debug] 첫 번째 이벤트 날짜 데이터 타입:", typeof dtstart);
      console.log("[Debug] 첫 번째 이벤트 날짜 값:", dtstart);
    }

    const parsedEvents = events.map((item) => {
      // getFirstPropertyValue 대신 getFirstProperty().getValue() 사용 시도 등 안전장치
      let dateVal = item.getFirstPropertyValue("dtstart");
      if (!dateVal) dateVal = item.getFirstPropertyValue("due"); // 과제

      const jsDate = forceParseDate(dateVal);

      // 날짜 파싱 실패 시 로그 남기고 건너뛰기
      if (!jsDate) {
        // console.log("날짜 변환 실패:", item.getFirstPropertyValue("summary"));
        return null;
      }

      const summary = item.getFirstPropertyValue("summary") as string;
      const description = item.getFirstPropertyValue("description");
      const title = summary || "제목 없음";
      
      const codeRegex = /[A-Z]{3}[0-9]{4}/;
      const foundCode = title.match(codeRegex);
      
      return {
        title: title,
        date: jsDate.toISOString().split('T')[0],
        courseCode: foundCode ? foundCode[0] : null,
        desc: (typeof description === 'string' ? description : "").slice(0, 50)
      };
    })
    .filter((e) => e !== null) // null 제거
    .sort((a, b) => new Date(a!.date).getTime() - new Date(b!.date).getTime());
    
    console.log(`[Planner] 최종 변환 성공 개수: ${parsedEvents.length}개`);
    return parsedEvents;

  } catch (parseError) {
    console.error("[Planner] 파싱 에러:", parseError);
    throw new Error("데이터를 해석할 수 없습니다.");
  }
};
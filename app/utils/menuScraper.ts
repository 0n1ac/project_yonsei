interface MenuDay {
  day: string;
  date?: string;
  breakfast?: string[];
  lunch?: string[];
  dinner?: string[];
}

interface WeeklyMenu {
  week: MenuDay[];
  todayIndex: number;
}

/**
 * 오늘의 요일을 한글로 반환 (월, 화, 수, 목, 금, 토, 일)
 */
const getTodayKorean = (): string => {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return days[new Date().getDay()];
};

/**
 * HTML 텍스트에서 메뉴 데이터를 추출
 */
const parseMenuHTML = (html: string): WeeklyMenu => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  const weekMenu: MenuDay[] = [];
  const today = getTodayKorean();
  let todayIndex = -1;

  try {
    // 테이블 찾기 - 여러 가능성 시도
    const tables = doc.querySelectorAll("table");
    let menuTable: HTMLTableElement | null = null;

    // 가장 큰 테이블을 메뉴 테이블로 간주
    for (const table of Array.from(tables)) {
      const rows = table.querySelectorAll("tr");
      if (rows.length > 3) {
        menuTable = table as HTMLTableElement;
        break;
      }
    }

    if (!menuTable) {
      throw new Error("메뉴 테이블을 찾을 수 없습니다.");
    }

    // 테이블 행 파싱
    const rows = Array.from(menuTable.querySelectorAll("tr"));
    
    // 요일 헤더 찾기
    const dayNames = ["월", "화", "수", "목", "금", "토", "일"];
    let headerRowIndex = -1;
    let dayColumns: number[] = [];

    for (let i = 0; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll("th, td"));
      const cellTexts = cells.map(c => c.textContent?.trim() || "");
      
      // 요일이 포함된 행 찾기
      const foundDays = cellTexts.filter(text => 
        dayNames.some(day => text.includes(day))
      );
      
      if (foundDays.length >= 3) {
        headerRowIndex = i;
        // 각 요일이 어느 컬럼에 있는지 저장
        dayColumns = cellTexts.map((text, idx) => 
          dayNames.some(day => text.includes(day)) ? idx : -1
        ).filter(idx => idx !== -1);
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error("요일 헤더를 찾을 수 없습니다.");
    }

    // 각 요일별로 데이터 추출
    const headerCells = Array.from(rows[headerRowIndex].querySelectorAll("th, td"));
    
    dayColumns.forEach((colIdx, idx) => {
      const headerText = headerCells[colIdx]?.textContent?.trim() || "";
      const dayName = dayNames.find(d => headerText.includes(d)) || "";
      
      if (!dayName) return;

      const menuDay: MenuDay = {
        day: dayName,
        breakfast: [],
        lunch: [],
        dinner: []
      };

      // 해당 컬럼의 데이터 추출
      for (let rowIdx = headerRowIndex + 1; rowIdx < rows.length; rowIdx++) {
        const cells = Array.from(rows[rowIdx].querySelectorAll("td"));
        if (cells.length <= colIdx) continue;

        const cell = cells[colIdx];
        const text = cell.textContent?.trim() || "";
        
        if (!text || text.length < 2) continue;

        // 행의 첫 번째 셀에서 식사 종류 파악
        const firstCell = cells[0]?.textContent?.trim().toLowerCase() || "";
        
        if (firstCell.includes("조식") || firstCell.includes("breakfast")) {
          menuDay.breakfast?.push(text);
        } else if (firstCell.includes("중식") || firstCell.includes("lunch")) {
          menuDay.lunch?.push(text);
        } else if (firstCell.includes("석식") || firstCell.includes("dinner")) {
          menuDay.dinner?.push(text);
        } else {
          // 식사 종류를 모를 경우 중식으로 간주
          menuDay.lunch?.push(text);
        }
      }

      // 오늘인지 확인
      if (dayName === today) {
        todayIndex = weekMenu.length;
      }

      weekMenu.push(menuDay);
    });

  } catch (error) {
    console.error("[Parser] 에러:", error);
  }

  return {
    week: weekMenu,
    todayIndex
  };
};

/**
 * 메뉴 데이터를 사람이 읽기 쉬운 텍스트로 변환
 */
const formatMenuToText = (menuData: WeeklyMenu): string => {
  const { week, todayIndex } = menuData;
  
  if (week.length === 0) {
    return "메뉴 정보를 파싱할 수 없습니다. 원본 HTML을 확인해주세요.";
  }

  let result = "📅 이번 주 학식 메뉴\n\n";

  week.forEach((dayMenu, index) => {
    const isToday = index === todayIndex;
    const marker = isToday ? "👉 " : "";
    
    result += `${marker}${dayMenu.day}요일${isToday ? " (오늘)" : ""}\n`;
    result += "─────────────────\n";

    if (dayMenu.breakfast && dayMenu.breakfast.length > 0) {
      result += `🍳 조식: ${dayMenu.breakfast.join(", ")}\n`;
    }
    
    if (dayMenu.lunch && dayMenu.lunch.length > 0) {
      result += `🍱 중식: ${dayMenu.lunch.join(", ")}\n`;
    }
    
    if (dayMenu.dinner && dayMenu.dinner.length > 0) {
      result += `🍛 석식: ${dayMenu.dinner.join(", ")}\n`;
    }

    if (!dayMenu.breakfast?.length && !dayMenu.lunch?.length && !dayMenu.dinner?.length) {
      result += "메뉴 정보 없음\n";
    }

    result += "\n";
  });

  return result;
};

/**
 * 오늘의 학식 메뉴를 가져오는 메인 함수
 */
export const fetchTodayMenu = async () => {
  try {
    console.log("[Scraper] 학식 데이터 요청 시작...");
    
    // 1. 프록시 호출
    const res = await fetch("/api/proxy-menu");
    if (!res.ok) throw new Error(`서버 응답 에러: ${res.status}`);

    const html = await res.text();
    console.log(`[Scraper] HTML 수신 성공 (길이: ${html.length})`);

    // HTML이 너무 짧으면 에러
    if (html.length < 100) {
      return "에러: 서버로부터 유효한 데이터를 받지 못했습니다.";
    }

    // 2. HTML 파싱
    const menuData = parseMenuHTML(html);

    // 3. 텍스트로 변환
    const formattedText = formatMenuToText(menuData);

    console.log("[Scraper] 메뉴 파싱 완료:", formattedText.substring(0, 100));
    
    return formattedText;

  } catch (e) {
    console.error("[Scraper] 에러 발생:", e);
    return "에러: 학식 정보를 가져오는 중 문제가 발생했습니다.";
  }
};
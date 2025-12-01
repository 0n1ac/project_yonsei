/**
 * 오늘 요일을 한글로 반환
 */
const getTodayKorean = (): string => {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return days[new Date().getDay()];
};

export const fetchTodayMenu = async () => {
  try {
    console.log("[Scraper] 학식 데이터 요청 시작...");

    // 1. 프록시에서 weekData JSON 가져오기
    const res = await fetch("/api/proxy-menu");
    if (!res.ok) {
      console.error("[Scraper] Proxy 요청 실패:", res.status);
      return "에러: 학식 정보를 가져올 수 없습니다.";
    }

    const data = await res.json();

    if (!data.weekData) {
      console.error("[Scraper] weekData가 응답에 없습니다:", data);
      return data.error || "에러: 메뉴 데이터를 찾을 수 없습니다.";
    }

    const weekData = data.weekData;
    console.log(`[Scraper] weekData 수신 완료 (${weekData.length}일치)`);

    // 요일 이름 배열 (월~일)
    const dayNames = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

    // 국제캠퍼스 데이터만 추출
    let result = "📅 연세대 국제캠퍼스 이번 주 학식 메뉴\n\n";

    weekData.forEach((dayArray: any[], dayIndex: number) => {
      // 각 날짜의 배열에서 국제캠퍼스만 찾기
      const internationalCampus = dayArray.find((campus: any) => campus.campusName === "국제");

      if (!internationalCampus) {
        result += `${dayNames[dayIndex] || `${dayIndex + 1}일차`}: 국제캠퍼스 데이터 없음\n\n`;
        return;
      }

      result += `━━━━━━ ${dayNames[dayIndex] || `${dayIndex + 1}일차`} ━━━━━━\n\n`;

      // refectory 배열 순회 (각 식당)
      if (internationalCampus.refectory && internationalCampus.refectory.length > 0) {
        internationalCampus.refectory.forEach((restaurant: any) => {
          result += `🏢 ${restaurant.name}\n\n`;

          // type 배열 순회 (조식, 중식, 석식 등)
          if (restaurant.type && restaurant.type.length > 0) {
            restaurant.type.forEach((mealType: any) => {
              if (!mealType.name) return;

              result += `  📍 ${mealType.name}\n`;

              // item 배열 순회 (실제 메뉴)
              if (mealType.item && mealType.item.length > 0) {
                mealType.item.forEach((menuItem: any) => {
                  result += `     • ${menuItem.name} (${menuItem.price}원)\n`;
                });
              } else {
                result += `     메뉴 없음\n`;
              }
              result += `\n`;
            });
          }
        });
      } else {
        result += "식당 정보 없음\n";
      }

      result += "\n";
    });

    console.log("[Scraper] 국제캠퍼스 메뉴 포맷팅 완료");
    return result;

  } catch (e) {
    console.error("[Scraper] 에러:", e);
    return "에러: 학식 정보를 가져오는 중 문제가 발생했습니다.";
  }
};
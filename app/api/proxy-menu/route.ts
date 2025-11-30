import { NextResponse } from "next/server";

export async function GET() {
  // ✨ [수정됨] 모바일 페이지(/m/...) 대신 데이터가 꽉 찬 'PC 버전 식단표 주소'로 변경
  const targetUrl = "https://www.yonseicoop.co.kr/coop/food_menu.php";

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      },
      // @ts-ignore
      rejectUnauthorized: false 
    });

    if (!response.ok) {
      console.error("[Menu Proxy] Fetch Failed:", response.status);
      return NextResponse.json({ error: `Fetch failed: ${response.status}` }, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    
    // PC 사이트는 EUC-KR일 확률이 높지만, 최근엔 UTF-8도 많음.
    // 일단 UTF-8로 시도하고, 만약 한글이 깨지면 'euc-kr'로 바꿔야 합니다.
    const decoder = new TextDecoder('utf-8'); 
    const htmlData = decoder.decode(buffer);

    return new NextResponse(htmlData, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });

  } catch (error: any) {
    console.error("[Menu Proxy] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
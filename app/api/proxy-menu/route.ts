import { NextResponse } from "next/server";

export async function GET() {
  // 연세 생협(송도 2식당) 모바일 페이지 URL
  const targetUrl = "https://yonseicoop.co.kr/m/?act=info.page&seq=29";

  try {
    console.log("[Proxy] 1. Fetching main page...");

    // 1. 메인 페이지 가져오기
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!response.ok) {
      console.error("[Proxy] Main page fetch failed:", response.status);
      return NextResponse.json({ error: "Menu fetch failed" }, { status: response.status });
    }

    const htmlData = await response.text();
    console.log(`[Proxy] Main page loaded (${htmlData.length} bytes)`);

    // 2. iframe src 추출
    const iframeMatch = htmlData.match(/<iframe[^>]*src=["']([^"']+)["']/i);
    if (!iframeMatch) {
      console.error("[Proxy] No iframe found");
      return NextResponse.json({ error: "No iframe found" }, { status: 500 });
    }

    let iframeSrc = iframeMatch[1];
    console.log(`[Proxy] 2. Found iframe: ${iframeSrc}`);

    // 3. 상대 경로를 절대 경로로 변환
    if (!iframeSrc.startsWith("http")) {
      iframeSrc = `https://yonseicoop.co.kr${iframeSrc}`;
    }

    // 4. iframe 콘텐츠 가져오기
    console.log("[Proxy] 3. Fetching iframe content...");
    const iframeResponse = await fetch(iframeSrc, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!iframeResponse.ok) {
      console.error("[Proxy] Iframe fetch failed:", iframeResponse.status);
      return NextResponse.json({ error: "Iframe fetch failed" }, { status: iframeResponse.status });
    }

    const iframeHtml = await iframeResponse.text();
    console.log(`[Proxy] Iframe loaded (${iframeHtml.length} bytes)`);

    // 5. weekData 추출
    const weekDataMatch = iframeHtml.match(/var\s+weekData\s*=\s*(\[[\s\S]*?\]);/);

    if (!weekDataMatch) {
      console.error("[Proxy] weekData not found in iframe");
      return NextResponse.json({ error: "weekData not found" }, { status: 500 });
    }

    const weekDataJson = weekDataMatch[1];
    console.log("[Proxy] 4. weekData extracted successfully");

    // 6. JSON 파싱해서 반환
    try {
      const weekData = JSON.parse(weekDataJson);
      console.log(`[Proxy] 5. Parsed ${weekData.length} days of menu data`);

      // 캠퍼스 이름들 확인
      const campusNames = weekData.map((d: any) => d.campusName);
      console.log(`[Proxy] 캠퍼스 이름들:`, campusNames);

      return NextResponse.json({ weekData }, { status: 200 });
    } catch (parseError) {
      console.error("[Proxy] JSON parse error:", parseError);
      return NextResponse.json({ error: "Failed to parse weekData" }, { status: 500 });
    }

  } catch (error) {
    console.error("[Proxy] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
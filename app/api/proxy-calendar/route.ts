import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userid = searchParams.get("userid");
  const authtoken = searchParams.get("authtoken");

  if (!userid || !authtoken) {
    return NextResponse.json({ error: "파라미터 부족" }, { status: 400 });
  }

  // 1. 우리가 요청하려던 런어스 원본 주소
  const targetUrl = `https://ys.learnus.org/calendar/export_execute.php?userid=${userid}&authtoken=${authtoken}&preset_what=all&preset_time=recentupcoming`;

  try {
    // 2. Next.js 서버가 직접 런어스에 요청 (서버->서버라 CORS 없음)
    // redirect: 'follow' 옵션 덕분에 리다이렉트 되어도 서버가 끝까지 쫓아가서 데이터를 받아옴
    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow", 
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `LearnUs Server Error: ${response.status}` }, { status: response.status });
    }

    // 3. 받아온 파일 내용(텍스트)을 읽음
    const icsData = await response.text();

    // 4. 클라이언트(브라우저)에게는 그냥 텍스트로 전달
    return new NextResponse(icsData, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
      },
    });

  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
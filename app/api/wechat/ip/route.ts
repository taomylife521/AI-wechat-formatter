import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    /**
     * 彻底放弃自动检测。
     * 因为在 Vercel/本地代理环境下，Header 或三方 API 拿到的
     * 永远是“入站 IP”（访客 IP 或代理节点 IP），
     * 而微信白名单需要的是“出站 IP”（服务器请求微信时的 IP）。
     * 两者绝大多数情况下不一致，显示出来会产生极大误导。
     * 
     * 唯一真值：直接请求微信，从报错信息中捕获。
     */
    return NextResponse.json({ 
      ip: "请点击下方探测按钮捕获真值",
      isManualRequired: true
    });
  } catch (_err) {
    return NextResponse.json({ ip: "请点击探测按钮" });
  }
}
}

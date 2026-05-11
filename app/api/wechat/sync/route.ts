import axios from "axios";
import { type NextRequest, NextResponse } from "next/server";
import type { WeChatSyncRequest } from "../../../_types/wechat";
import {
  addWeChatDraft,
  getWeChatAccessToken,
  processHtmlImages,
  uploadCoverToWeChat,
  WeChatApiError,
} from "../utils";

export const runtime = "nodejs"; // 必须使用 nodejs runtime 以支持 sharp 和 jsdom

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WeChatSyncRequest;
    const { html, title, config, coverImage, markdown } = body;

    if (!html || !title || !config.appId || !config.appSecret) {
      return NextResponse.json(
        { success: false, error: "参数不完整，请检查配置" },
        { status: 400 },
      );
    }

    // 辅助函数：安全获取图片 Buffer
    const getSafeImageBuffer = async (url: string): Promise<Buffer | null> => {
      try {
        if (url.startsWith("data:image")) {
          return Buffer.from(url.split(",")[1], "base64");
        }
        if (url.startsWith("http")) {
          const res = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 5000,
          });
          return Buffer.from(res.data);
        }
        // 忽略相对路径图片，因为服务器无法直接获取
        return null;
      } catch (e) {
        console.error(`Failed to fetch image: ${url}`, e);
        return null;
      }
    };

    // 1. 获取 Access Token
    let accessToken: string;
    try {
      accessToken = await getWeChatAccessToken(config.appId, config.appSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const detectedIp = err instanceof WeChatApiError ? err.detectedIp : "";
      return NextResponse.json(
        {
          success: false,
          error: "微信授权失败",
          details: message,
          detectedIp: detectedIp,
        },
        { status: 401 },
      );
    }

    // 2. 图片转存与 HTML 替换
    let finalHtml: string;
    try {
      finalHtml = await processHtmlImages(accessToken, html);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { success: false, error: "内容处理失败 (JSDOM/Sharp)", details: message },
        { status: 500 },
      );
    }

    // 3. 处理封面图
    let thumbMediaId = "";
    try {
      let coverBuffer: Buffer | null = null;
      const filename = "cover.jpg";

      if (coverImage) {
        coverBuffer = await getSafeImageBuffer(coverImage);
      }

      if (!coverBuffer) {
        // 如果没传封面图或获取失败，尝试从 HTML 中提取第一张
        const imgMatch = html.match(/<img[^>]+src="([^">]+)"/i);
        if (imgMatch) {
          coverBuffer = await getSafeImageBuffer(imgMatch[1]);
        }
      }

      if (!coverBuffer) {
        throw new Error("未能获取到有效的封面图。请确保至少有一张公网可访问的图片或上传本地图片。");
      }

      thumbMediaId = await uploadCoverToWeChat(accessToken, coverBuffer, filename);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { success: false, error: "封面图上传失败", details: message },
        { status: 500 },
      );
    }

    // 4. 生成摘要
    const safeMarkdown = markdown || "";
    const digest = safeMarkdown
      .slice(0, 120)
      .replace(/#|\*|`|>|\[|\]|\(|\)/g, "")
      .trim();

    // 5. 新建草稿
    const mediaId = await addWeChatDraft(
      accessToken,
      title,
      finalHtml,
      thumbMediaId,
      config.author,
      digest,
    );

    return NextResponse.json({
      success: true,
      mediaId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("WeChat sync global error:", err);
    return NextResponse.json(
      { success: false, error: "服务器异常", details: message },
      { status: 500 },
    );
  }
}

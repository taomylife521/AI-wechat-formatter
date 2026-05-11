import type {
  CreateDraftInput,
  CreateDraftResult,
  PlatformCapabilities,
  PublishAdapter,
} from "../types";

const capabilities: PlatformCapabilities = {
  supportsHtml: true,
  supportsMarkdown: false,
  supportsImageUpload: true,
  supportsCoverImage: true,
  supportsDraft: true,
};

async function createDraft(input: CreateDraftInput): Promise<CreateDraftResult> {
  const workerUrl = process.env.SYNC_WORKER_URL;
  const workerSecret = process.env.SYNC_WORKER_SECRET;

  if (!workerUrl) {
    return {
      success: false,
      error: "Sync worker 未配置，请联系管理员",
    };
  }

  // TODO: 实现 HMAC 签名请求
  // 1. 构造请求 body：{ article, credentials: { appId } }
  //    注意：不传 AppSecret 给 worker，worker 应独立持有或通过安全通道获取
  // 2. 计算 HMAC-SHA256 签名，header: X-TypeZen-Signature
  // 3. 设置超时和重试策略
  // 4. 解析 worker 响应并映射为 CreateDraftResult

  const body = {
    article: input.article,
    credentials: { appId: input.credentials.appId },
  };

  try {
    const res = await fetch(`${workerUrl}/api/wechat/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO: 添加 HMAC 签名 header
        ...(workerSecret ? { "X-TypeZen-Worker-Secret": workerSecret } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        success: false,
        error: `Sync worker 返回错误 (${res.status})`,
        details: text.slice(0, 200),
      };
    }

    const data = (await res.json()) as CreateDraftResult;
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: "Sync worker 请求失败",
      details: message,
    };
  }
}

export const wechatRemoteAdapter: PublishAdapter = {
  platform: "wechat",
  capabilities,
  createDraft,
};

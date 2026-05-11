import { type NextRequest, NextResponse } from "next/server";
import { verifyLicense } from "../../../_lib/license";
import type { LicenseVerifyResponse } from "../../../_types/billing";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { licenseKey?: string };
    const { licenseKey } = body;

    if (!licenseKey || typeof licenseKey !== "string") {
      return NextResponse.json(
        { valid: false, error: "请提供 License Key" } satisfies LicenseVerifyResponse,
        { status: 400 },
      );
    }

    const result = verifyLicense(licenseKey);
    const status = result.valid ? 200 : 403;

    return NextResponse.json(result satisfies LicenseVerifyResponse, { status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "服务器异常";
    return NextResponse.json({ valid: false, error: message } satisfies LicenseVerifyResponse, {
      status: 500,
    });
  }
}

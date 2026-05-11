import { createHash } from "node:crypto";
import type { LicensePlan, LicenseVerifyResponse } from "../_types/billing";

type StoredLicenseEntry = {
  hash: string;
  email: string;
  plan: LicensePlan;
  expiresAt?: string;
};

function parseLicenseEntries(): StoredLicenseEntry[] {
  const raw = process.env.TYPEZEN_LICENSE_KEYS;
  if (!raw) return [];

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry): StoredLicenseEntry[] => {
      const parts = entry.split(":");
      if (parts.length < 2) return [];
      const [hash, email, plan, expiresAt] = parts;
      return [
        {
          hash: hash.toLowerCase(),
          email: email || "",
          plan: (plan as LicensePlan) || "pro",
          expiresAt: expiresAt || undefined,
        },
      ];
    });
}

export function hashLicenseKey(key: string): string {
  return createHash("sha256").update(key.trim()).digest("hex").toLowerCase();
}

export function verifyLicense(key: string): LicenseVerifyResponse {
  const trimmedKey = key.trim();
  if (!trimmedKey) {
    return { valid: false, error: "请输入 License Key" };
  }

  const entries = parseLicenseEntries();
  if (entries.length === 0) {
    return { valid: false, error: "License 服务未配置，请联系管理员" };
  }

  const inputHash = hashLicenseKey(trimmedKey);
  const match = entries.find((entry) => entry.hash === inputHash);

  if (!match) {
    return { valid: false, error: "License Key 无效，请检查后重试" };
  }

  if (match.expiresAt) {
    const expiresAt = new Date(match.expiresAt);
    if (Number.isNaN(expiresAt.getTime())) {
      return { valid: false, error: "License 配置异常，请联系管理员" };
    }
    if (expiresAt < new Date()) {
      return { valid: false, error: "License 已过期，请续费后重试" };
    }
  }

  return {
    valid: true,
    plan: match.plan,
    email: match.email,
    expiresAt: match.expiresAt,
  };
}

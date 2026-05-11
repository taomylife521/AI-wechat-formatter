import { useCallback, useEffect, useState } from "react";
import type { LicenseStatus, LicenseVerifyResponse } from "../_types/billing";

const LICENSE_KEY_STORAGE = "typezen_license_key";
const LICENSE_STATUS_STORAGE = "typezen_license_status";

type StoredLicenseStatus = {
  plan?: string;
  email?: string;
  expiresAt?: string;
  verifiedAt: string;
};

export function useLicense() {
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>("idle");
  const [licensePlan, setLicensePlan] = useState<string>("");
  const [licenseError, setLicenseError] = useState("");

  // Load saved license from localStorage on mount and re-verify with server
  useEffect(() => {
    const savedKey = localStorage.getItem(LICENSE_KEY_STORAGE);
    if (!savedKey) return;

    setLicenseKey(savedKey);
    setLicenseStatus("checking");

    fetch("/api/license/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey: savedKey }),
    })
      .then((res) => res.json() as Promise<LicenseVerifyResponse>)
      .then((data) => {
        if (data.valid) {
          setLicenseStatus("active");
          setLicensePlan(data.plan || "pro");
          setLicenseError("");
          // Update cached status
          localStorage.setItem(
            LICENSE_STATUS_STORAGE,
            JSON.stringify({
              plan: data.plan,
              email: data.email,
              expiresAt: data.expiresAt,
              verifiedAt: new Date().toISOString(),
            } satisfies StoredLicenseStatus),
          );
        } else {
          // License no longer valid (expired, revoked, etc.)
          setLicenseStatus("invalid");
          setLicenseError(data.error || "License 已失效");
          localStorage.removeItem(LICENSE_KEY_STORAGE);
          localStorage.removeItem(LICENSE_STATUS_STORAGE);
        }
      })
      .catch(() => {
        // Network error — keep key but don't mark active
        setLicenseStatus("idle");
        setLicenseError("");
      });
  }, []);

  const verifyLicenseKey = useCallback(
    async (key?: string) => {
      const keyToVerify = key ?? licenseKey;
      if (!keyToVerify.trim()) {
        setLicenseError("请输入 License Key");
        return false;
      }

      setLicenseStatus("checking");
      setLicenseError("");

      try {
        const res = await fetch("/api/license/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ licenseKey: keyToVerify.trim() }),
        });

        const data: LicenseVerifyResponse = await res.json();

        if (data.valid) {
          setLicenseStatus("active");
          setLicensePlan(data.plan || "pro");
          setLicenseError("");

          // Save to localStorage
          localStorage.setItem(LICENSE_KEY_STORAGE, keyToVerify.trim());
          localStorage.setItem(
            LICENSE_STATUS_STORAGE,
            JSON.stringify({
              plan: data.plan,
              email: data.email,
              expiresAt: data.expiresAt,
              verifiedAt: new Date().toISOString(),
            } satisfies StoredLicenseStatus),
          );
          return true;
        }

        setLicenseStatus("invalid");
        setLicenseError(data.error || "License 验证失败");
        return false;
      } catch {
        setLicenseStatus("invalid");
        setLicenseError("网络错误，请稍后重试");
        return false;
      }
    },
    [licenseKey],
  );

  const clearLicense = useCallback(() => {
    setLicenseKey("");
    setLicenseStatus("idle");
    setLicensePlan("");
    setLicenseError("");
    localStorage.removeItem(LICENSE_KEY_STORAGE);
    localStorage.removeItem(LICENSE_STATUS_STORAGE);
  }, []);

  const isLicenseActive = licenseStatus === "active";

  return {
    licenseKey,
    setLicenseKey,
    licenseStatus,
    licensePlan,
    licenseError,
    isLicenseActive,
    verifyLicenseKey,
    clearLicense,
  };
}

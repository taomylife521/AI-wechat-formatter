export type LicensePlan = "pro" | "team";

export type LicenseStatus = "idle" | "checking" | "active" | "expired" | "revoked" | "invalid";

export type LicenseVerifyResponse = {
  valid: boolean;
  plan?: LicensePlan;
  email?: string;
  expiresAt?: string;
  error?: string;
};

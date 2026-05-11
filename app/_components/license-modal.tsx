import { track } from "@vercel/analytics";
import { Key, Loader2, ShieldCheck, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { LicenseStatus } from "../_types/billing";

type LicenseModalProps = {
  open: boolean;
  onClose: () => void;
  licenseKey: string;
  setLicenseKey: (key: string) => void;
  licenseStatus: LicenseStatus;
  licensePlan: string;
  licenseError: string;
  onVerify: (key?: string) => Promise<boolean>;
  onClear: () => void;
  showToast: (message: string, type: "success" | "error") => void;
};

export function LicenseModal({
  open,
  onClose,
  licenseKey,
  setLicenseKey,
  licenseStatus,
  licensePlan,
  licenseError,
  onVerify,
  onClear,
  showToast,
}: LicenseModalProps) {
  const [inputValue, setInputValue] = useState(licenseKey);

  const handleVerify = async () => {
    track("license_submitted");
    const ok = await onVerify(inputValue);
    if (ok) {
      track("license_verified", { plan: licensePlan });
      showToast("License 验证成功！", "success");
      onClose();
    }
  };

  const handleClear = () => {
    onClear();
    setInputValue("");
    showToast("License 已清除", "success");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center neo-modal-backdrop animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="neo-modal flex flex-col max-w-md w-full mx-4 transform transition-all shadow-[12px_12px_0_0_rgba(0,0,0,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 shrink-0 border-b-[3px] border-(--neo-ink) bg-(--neo-surface)">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-(--neo-yellow) border-2 border-(--neo-ink) shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              <Key className="w-5 h-5 text-(--neo-ink)" />
            </div>
            <div>
              <h3 className="text-xl font-black text-(--neo-ink) uppercase leading-none">
                Pro License
              </h3>
              <p className="text-[10px] neo-text-muted font-bold mt-1 uppercase tracking-wider">
                Unlock WeChat Auto-Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-2 border-(--neo-ink) hover:bg-(--neo-pink) transition-colors font-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 bg-(--neo-surface)/30">
          {licenseStatus === "active" ? (
            <div className="space-y-4 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 p-4 bg-(--neo-green)/10 border-[3px] border-(--neo-green) shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <ShieldCheck className="w-6 h-6 text-(--neo-green)" />
                <div>
                  <p className="font-black text-(--neo-ink)">License 已激活</p>
                  <p className="text-xs font-bold text-(--neo-muted)">
                    {licensePlan.toUpperCase()} 版 · 可使用微信自动同步
                  </p>
                </div>
              </div>

              <button
                onClick={handleClear}
                className="w-full py-3 border-[3px] border-(--neo-ink) font-black text-sm flex items-center justify-center gap-2 hover:bg-(--neo-pink) hover:text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <Trash2 className="w-4 h-4" />
                清除 License 并退出 Pro
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-bold text-(--neo-muted) leading-relaxed">
                输入 Pro License Key 以解锁微信公众号自动同步功能。
                免费版编辑、预览和一键复制不受影响。
              </p>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-(--neo-muted) flex items-center gap-1">
                  License Key <span className="text-(--neo-pink)">*</span>
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className="neo-input w-full px-3 py-3 font-mono text-sm border-b-[3px] focus:bg-(--neo-surface)"
                  placeholder="输入您的 License Key"
                  autoComplete="off"
                />
              </div>

              {licenseError && (
                <p className="text-xs font-bold text-(--neo-pink) bg-(--neo-pink)/10 p-3 border-2 border-(--neo-pink)">
                  {licenseError}
                </p>
              )}

              <button
                onClick={handleVerify}
                disabled={licenseStatus === "checking" || !inputValue.trim()}
                className="neo-button bg-(--neo-yellow) text-(--neo-ink) w-full py-4 text-lg font-black flex items-center justify-center gap-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {licenseStatus === "checking" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    验证中...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    验证 License
                  </>
                )}
              </button>

              <div className="bg-(--neo-cyan) border-[3px] border-(--neo-ink) p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="text-xs font-black mb-2">还没有 License？</p>
                <p className="text-[10px] font-bold text-(--neo-ink)/80 leading-relaxed">
                  Pro Early Access 定价 ¥199/年。发送邮件至{" "}
                  <a
                    href="mailto:hello@typezen.online"
                    className="underline text-(--neo-pink) hover:text-(--neo-ink) transition-colors"
                  >
                    hello@typezen.online
                  </a>{" "}
                  说明你的使用场景即可申请。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 shrink-0 bg-(--neo-surface)/50">
          <p className="text-[9px] neo-text-muted font-bold text-center">
            License Key 仅保存在浏览器本地，可随时清除
          </p>
        </div>
      </div>
    </div>
  );
}

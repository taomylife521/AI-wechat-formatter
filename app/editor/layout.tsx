import type { Metadata } from "next";
import { EDITOR_TITLE, EDITOR_DESCRIPTION, SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: EDITOR_TITLE,
  description: EDITOR_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/editor`,
  },
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return children;
}

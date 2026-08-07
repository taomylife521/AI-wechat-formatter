import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
import { LandingHeader } from "./_components/landing/header";
import { LandingHero } from "./_components/landing/hero";
import { LandingFeatures } from "./_components/landing/features";
import { LandingHowItWorks } from "./_components/landing/how-it-works";
import { LandingTestimonials } from "./_components/landing/testimonials";
import { LandingBlogSection } from "./_components/landing/blog-section";
import { LandingFAQ } from "./_components/landing/faq";
import { LandingFooter } from "./_components/landing/footer";

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col neo-app-bg font-sans scroll-smooth">
      <LandingHeader />

      <div className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingTestimonials />
        <LandingBlogSection />
        <LandingFAQ />
      </div>

      <LandingFooter />
    </main>
  );
}


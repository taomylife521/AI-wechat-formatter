import { ArrowLeft, BookOpen, Calendar, Clock } from "lucide-react";
import { Marked } from "marked";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_BRAND, SITE_URL } from "@/lib/site-config";
import { LandingFooter } from "../../_components/landing/footer";
import { LandingHeader } from "../../_components/landing/header";
import type { BlogPost } from "../_data/posts";
import { blogPosts } from "../_data/posts";

type Props = {
  params: Promise<{ slug: string }>;
};

// 计算相关阅读：同分类优先（按日期倒序），不足再用最新其他文章补齐，始终排除当前篇
function getRelatedPosts(current: BlogPost, count: number): BlogPost[] {
  const others = blogPosts.filter((p) => p.slug !== current.slug);
  const sameCategory = others
    .filter((p) => p.category === current.category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sameCategory.length >= count) {
    return sameCategory.slice(0, count);
  }

  const fill = others
    .filter((p) => p.category !== current.category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return [...sameCategory, ...fill].filter(Boolean).slice(0, count);
}

// 预渲染静态参数
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// 动态生成元数据以利于 Google SEO 收录
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "文章未找到 | TypeZen",
    };
  }

  const title = `${post.title} | TypeZen Blog`;

  return {
    title,
    description: post.description,
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [SITE_BRAND],
    },
  };
}

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // 使用 marked 解析 Markdown 并过滤/安全渲染
  const markedInstance = new Marked();
  const rawHtml = await markedInstance.parse(post.content);

  // 相关阅读：优先同分类，不足则用最新其他文章补齐，均排除当前篇
  const related = getRelatedPosts(post, 3);

  return (
    <main className="min-h-screen flex flex-col neo-app-bg font-sans">
      <LandingHeader />

      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <article className="neo-panel bg-(--neo-surface) p-6 sm:p-12">
          {/* Back Button */}
          <Link
            href="/blog"
            className="neo-button neo-button-ghost px-4 py-2 text-sm flex items-center gap-2 w-fit mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> 返回 Blog 列表
          </Link>

          {/* Header Section */}
          <header className="border-b-[3px] border-(--neo-ink) pb-8 mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="text-xs font-black uppercase text-black bg-(--neo-pink) px-2.5 py-1 border-2 border-(--neo-ink)">
                {post.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-(--neo-muted)">
                <Calendar className="w-4 h-4" />
                <span>发布于 {post.date}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-(--neo-muted)">
                <Clock className="w-4 h-4" />
                <span>阅读需 {post.readTime}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-(--neo-ink) leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-base sm:text-lg font-bold text-(--neo-muted) leading-relaxed italic bg-black/5 dark:bg-white/5 p-4 border-l-4 border-(--neo-pink)">
              前言概要：{post.description}
            </p>
          </header>

          {/* Article content (HTML from Markdown) */}
          <div
            className="prose-neo text-base sm:text-lg font-medium text-(--neo-ink) leading-relaxed"
            dangerouslySetInnerHTML={{ __html: rawHtml }}
          />
        </article>

        {/* 相关阅读：加强文章内链，利于 SEO 爬深与权重传递 */}
        {related.length > 0 && (
          <section className="mt-12" aria-labelledby="related-posts">
            <div className="flex items-center gap-3 mb-6">
              <h2
                id="related-posts"
                className="text-xl sm:text-2xl font-black tracking-tight text-(--neo-ink)"
              >
                相关阅读
              </h2>
              <span className="text-xs font-black uppercase text-black bg-(--neo-cyan) px-2 py-1 border-2 border-(--neo-ink)">
                Keep Reading
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="neo-panel bg-(--neo-surface) flex flex-col justify-between p-5 hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_var(--neo-shadow-core)] transition-all duration-150"
                >
                  <div>
                    <span className="inline-block text-[11px] font-black uppercase text-(--neo-muted) px-2 py-0.5 mb-3 border-2 border-(--neo-ink)">
                      {item.category}
                    </span>
                    <h3 className="text-base font-black text-(--neo-ink) leading-snug mb-3 hover:text-(--neo-pink) transition-colors line-clamp-3">
                      {item.title}
                    </h3>
                  </div>
                  <div className="pt-3 border-t-2 border-dashed border-(--neo-ink) flex items-center justify-between text-xs font-bold text-(--neo-muted)">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                    <span className="flex items-center gap-1 hover:text-(--neo-pink) transition-colors">
                      阅读 <BookOpen className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <LandingFooter />
    </main>
  );
}

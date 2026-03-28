import type { JSONContent } from "@tiptap/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import DocumentViewer from "@/components/revisions/DocumentViewer";

type Article = {
  id: string;
  title: string;
  summary: string;
  linked_problem: string | null;
  content_json: JSONContent;
  code_sample: string;
  language: string;
  author_name: string;
  is_published: boolean;
  published_at: string | null;
};

export default function ArticleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== "string") {
      return;
    }

    const loadArticle = async () => {
      try {
        const response = await fetch(`/api/articles/public/${id}`);
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error ?? "Unable to load article");
        }

        setArticle(json.article);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load article");
      } finally {
        setLoading(false);
      }
    };

    void loadArticle();
  }, [id]);

  if (loading) {
    return <main className="min-h-screen bg-bg px-4 py-8 text-sm text-textSecondary">Loading article...</main>;
  }

  if (error || !article) {
    return <main className="min-h-screen bg-bg px-4 py-8 text-sm text-red-600">{error ?? "Article not found"}</main>;
  }

  return (
    <main className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/articles" className="text-sm font-medium text-primary hover:underline">
            Back to Articles
          </Link>

          {!article.is_published && (
            <Link
              href={`/revisions/${article.id}/edit`}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-textPrimary transition hover:border-primary hover:text-primary"
            >
              Edit Draft
            </Link>
          )}
        </div>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-textSecondary">
            {article.is_published ? "Published Article" : "Private Draft"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-textPrimary">{article.title}</h1>
          <p className="mt-2 text-sm text-textSecondary">By {article.author_name}</p>
        </section>

        <DocumentViewer
          title={article.title}
          linkedProblem={article.linked_problem ?? ""}
          summary={article.summary}
          contentJson={article.content_json}
          codeSample={article.code_sample}
          language={article.language}
        />
      </div>
    </main>
  );
}

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ArticleSummary = {
  id: string;
  title: string;
  summary: string;
  author_name: string;
  linked_problem: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
};

type CurrentUser = {
  id: string;
  email: string;
};

function PublicArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-textPrimary">{article.title}</h3>
            <p className="mt-1 text-sm text-textSecondary">By {article.author_name}</p>
          </div>
        </div>

        {article.linked_problem && (
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-textSecondary">
            Linked Problem: {article.linked_problem}
          </p>
        )}

        <p className="text-sm leading-6 text-gray-700">{article.summary}</p>
      </div>
    </Link>
  );
}

function MyArticleCard({
  article,
  onPublish,
  onDelete,
}: {
  article: ArticleSummary;
  onPublish: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<"publish" | "delete" | null>(null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/articles/${article.id}`} className="text-lg font-semibold text-textPrimary hover:text-primary">
              {article.title}
            </Link>
            <p className="mt-1 text-sm text-textSecondary">By {article.author_name}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
              article.is_published
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {article.is_published ? "Published" : "Draft"}
          </span>
        </div>

        {article.linked_problem && (
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-textSecondary">
            Linked Problem: {article.linked_problem}
          </p>
        )}

        <p className="text-sm leading-6 text-gray-700">{article.summary}</p>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/revisions/${article.id}/edit`}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-textPrimary transition hover:border-primary hover:text-primary"
          >
            Edit
          </Link>

          <button
            type="button"
            disabled={article.is_published || busy !== null}
            onClick={async () => {
              setBusy("publish");
              await onPublish(article.id);
              setBusy(null);
            }}
            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {article.is_published ? "Published" : busy === "publish" ? "Publishing..." : "Publish"}
          </button>

          <button
            type="button"
            disabled={busy !== null}
            onClick={async () => {
              setBusy("delete");
              await onDelete(article.id);
              setBusy(null);
            }}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "delete" ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  const [publicArticles, setPublicArticles] = useState<ArticleSummary[]>([]);
  const [myArticles, setMyArticles] = useState<ArticleSummary[]>([]);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadMine = async () => {
    const mineResponse = await fetch("/api/articles/mine");
    if (mineResponse.ok) {
      const mineJson = await mineResponse.json();
      setMyArticles(mineJson.articles ?? []);
    }
  };

  const loadPublic = async () => {
    const publicResponse = await fetch("/api/articles/public");
    const publicJson = await publicResponse.json();
    setPublicArticles(publicJson.articles ?? []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [_, meResponse] = await Promise.all([loadPublic(), fetch("/api/auth/me")]);

        if (meResponse.ok) {
          const meJson = await meResponse.json();
          setUser(meJson.user ?? null);
          await loadMine();
        }
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const handlePublish = async (id: string) => {
    setMessage(null);
    const response = await fetch(`/api/articles/publish/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: true }),
    });
    const json = await response.json();

    if (!response.ok) {
      setMessage(json.error ?? "Unable to publish article");
      return;
    }

    setMessage("Article published.");
    await Promise.all([loadMine(), loadPublic()]);
  };

  const handleDelete = async (id: string) => {
    setMessage(null);
    const response = await fetch(`/api/articles/${id}`, {
      method: "DELETE",
    });
    const json = await response.json();

    if (!response.ok) {
      setMessage(json.error ?? "Unable to delete article");
      return;
    }

    setMessage("Article deleted.");
    await Promise.all([loadMine(), loadPublic()]);
  };

  const publishedCount = useMemo(() => publicArticles.length, [publicArticles]);

  return (
    <main className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-textSecondary">Articles</p>
              <h1 className="mt-2 text-3xl font-semibold text-textPrimary">Revision Articles</h1>
              <p className="mt-2 max-w-2xl text-sm text-textSecondary">
                Browse published writeups from everyone, and keep your own drafts organized in My Articles.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className="rounded-2xl bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
                {publishedCount} public article{publishedCount === 1 ? "" : "s"}
              </div>
              {user ? (
                <Link href="/revisions/add" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primaryHover">
                  Write New Article
                </Link>
              ) : (
                <Link href="/signin" className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-textPrimary transition hover:border-primary hover:text-primary">
                  Sign in to write
                </Link>
              )}
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
            {message}
          </div>
        )}

        {user && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-textPrimary">My Articles</h2>
                <p className="mt-1 text-sm text-textSecondary">
                  Drafts stay private. Publish, edit, or delete them here.
                </p>
              </div>
            </div>

            {myArticles.length === 0 && !loading ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-textSecondary">
                You have not saved any articles yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myArticles.map((article) => (
                  <MyArticleCard
                    key={article.id}
                    article={article}
                    onPublish={handlePublish}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-textPrimary">Public Articles</h2>
            <p className="mt-1 text-sm text-textSecondary">Published articles are visible to everyone.</p>
          </div>

          {publicArticles.length === 0 && !loading ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-textSecondary">
              No public articles yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {publicArticles.map((article) => (
                <PublicArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

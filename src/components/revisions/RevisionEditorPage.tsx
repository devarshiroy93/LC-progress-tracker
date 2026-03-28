import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { JSONContent } from "@tiptap/react";

import DocumentViewer from "@/components/revisions/DocumentViewer";
import RevisionBody from "@/components/revisions/RevisionBody";
import RevisionHeader from "@/components/revisions/RevisionHeader";

const defaultDocument: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "Use this space for the actual explanation." }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Focus on the invariant, the turning point in the logic, and the mistake you do not want to repeat.",
        },
      ],
    },
  ],
};

const defaultCodeSample = `function lengthOfLongestSubstring(s) {
  let left = 0;
  let best = 0;
  const seen = new Map();

  for (let right = 0; right < s.length; right += 1) {
    const char = s[right];

    if (seen.has(char) && seen.get(char) >= left) {
      left = seen.get(char) + 1;
    }

    seen.set(char, right);
    best = Math.max(best, right - left + 1);
  }

  return best;
}`;

type TabKey = "AUTHOR" | "PREVIEW";

type EditorPageProps = {
  articleId?: string;
};

type ArticleResponse = {
  article: {
    id: string;
    title: string;
    linked_problem: string | null;
    summary: string;
    content_json: JSONContent;
    code_sample: string;
    language: string;
    is_published: boolean;
  };
};

export default function RevisionEditorPage({ articleId }: EditorPageProps) {
  const router = useRouter();
  const isEditing = Boolean(articleId);
  const [activeTab, setActiveTab] = useState<TabKey>("AUTHOR");
  const [title, setTitle] = useState("");
  const [linkedProblem, setLinkedProblem] = useState("");
  const [summary, setSummary] = useState(
    "A short recap that helps you remember the core trick in under 20 seconds."
  );
  const [documentJson, setDocumentJson] = useState<JSONContent>(defaultDocument);
  const [language, setLanguage] = useState("javascript");
  const [codeSample, setCodeSample] = useState(defaultCodeSample);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [savedArticleId, setSavedArticleId] = useState<string | null>(articleId ?? null);
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(isEditing);

  useEffect(() => {
    if (!articleId) {
      return;
    }

    const loadArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}`);
        const json = (await response.json()) as ArticleResponse | { error: string };

        if (!response.ok || !("article" in json)) {
          throw new Error("Unable to load article for editing");
        }

        const article = json.article;
        setSavedArticleId(article.id);
        setTitle(article.title);
        setLinkedProblem(article.linked_problem ?? "");
        setSummary(article.summary);
        setDocumentJson(article.content_json);
        setCodeSample(article.code_sample);
        setLanguage(article.language);
        setIsPublished(article.is_published);
      } catch (error) {
        setSaveMessage(error instanceof Error ? error.message : "Unable to load article");
      } finally {
        setLoadingArticle(false);
      }
    };

    void loadArticle();
  }, [articleId]);

  const tabs: { key: TabKey; label: string; description: string }[] = [
    { key: "AUTHOR", label: "Author", description: "Write and format the note" },
    { key: "PREVIEW", label: "Preview", description: "Review the final reading view" },
  ];

  const savePayload = {
    title,
    linkedProblem,
    summary,
    contentJson: documentJson,
    codeSample,
    language,
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(savedArticleId ? `/api/articles/${savedArticleId}` : "/api/articles", {
        method: savedArticleId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savePayload),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Unable to save article");
      }

      setSavedArticleId(json.article.id);
      setIsPublished(Boolean(json.article.is_published));
      setSaveMessage(savedArticleId ? "Article updated." : "Draft saved. You can now find it in My Articles.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Unable to save article");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!savedArticleId) {
      setSaveMessage("Save the draft first before publishing.");
      return;
    }

    setPublishing(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/articles/publish/${savedArticleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: true }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Unable to publish article");
      }

      setIsPublished(Boolean(json.article.is_published));
      setSaveMessage("Article published. It is now visible in Public Articles.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Unable to publish article");
    } finally {
      setPublishing(false);
    }
  };

  if (loadingArticle) {
    return <main className="min-h-screen bg-bg px-4 py-8 text-sm text-textSecondary">Loading article...</main>;
  }

  return (
    <main className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <RevisionHeader
          title={title}
          linkedProblem={linkedProblem}
          onTitleChange={setTitle}
          onLinkedProblemChange={setLinkedProblem}
        />

        <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-gray-200 bg-white hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-textPrimary">{tab.label}</p>
                      <p className="mt-1 text-sm text-textSecondary">{tab.description}</p>
                    </div>
                    {isActive && (
                      <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                        Active
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {activeTab === "AUTHOR" ? (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-textPrimary">Author Workspace</h2>
                <p className="mt-1 text-sm text-textSecondary">
                  Save a draft to place it in My Articles. Publish when it is ready for everyone.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/articles")}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-textPrimary transition hover:border-primary hover:text-primary"
                >
                  My Articles
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primaryHover disabled:opacity-60"
                >
                  {saving ? "Saving..." : isEditing ? "Update Article" : "Save Draft"}
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={!savedArticleId || isPublished || publishing}
                  className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPublished ? "Published" : publishing ? "Publishing..." : "Publish"}
                </button>
              </div>
            </div>

            {saveMessage && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                {saveMessage}
              </div>
            )}

            <RevisionBody
              summary={summary}
              initialContent={documentJson}
              codeSample={codeSample}
              language={language}
              onSummaryChange={setSummary}
              onDocumentChange={({ json }) => setDocumentJson(json)}
              onCodeSampleChange={setCodeSample}
              onLanguageChange={setLanguage}
            />
          </section>
        ) : (
          <section className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-textPrimary">Preview Workspace</h2>
              <p className="mt-1 text-sm text-textSecondary">
                This is the reading-side view of the article, so you can judge spacing, headings, and code clarity.
              </p>
            </div>

            <div className="mx-auto w-full max-w-4xl">
              <DocumentViewer
                title={title}
                linkedProblem={linkedProblem}
                summary={summary}
                contentJson={documentJson}
                codeSample={codeSample}
                language={language}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

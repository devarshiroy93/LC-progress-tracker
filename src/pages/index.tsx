import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type NavCardProps = {
  title: string;
  description: string;
  href: string;
  featured?: boolean;
  tone?: "neutral" | "warm" | "cool";
};

function NavCard({
  title,
  description,
  href,
  featured = false,
  tone = "neutral",
}: NavCardProps) {
  const toneClasses = {
    neutral: "border-gray-200 bg-white",
    warm: "border-amber-200 bg-amber-50/70",
    cool: "border-sky-200 bg-sky-50/70",
  }[tone];

  if (featured) {
    return (
      <Link
        href={href}
        className="group md:col-span-2 xl:col-span-3 overflow-hidden rounded-[2rem] border border-primary/30 bg-gradient-to-br from-primary to-primaryHover p-7 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              Focus
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              {title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              {description}
            </p>
          </div>
          <span className="inline-flex w-fit rounded-2xl bg-white px-5 py-3 text-sm font-bold text-primary transition group-hover:scale-[1.02]">
            Start now
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneClasses}`}
    >
      <div className="flex h-full flex-col justify-between gap-5">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary group-hover:text-primary">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-textSecondary">
            {description}
          </p>
        </div>
        <span className="text-sm font-semibold text-primary">Open</span>
      </div>
    </Link>
  );
}

function HomeLoader() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="md:col-span-2 xl:col-span-3 overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-7 shadow-sm">
        <div className="flex animate-pulse flex-col gap-5">
          <div className="h-3 w-20 rounded-full bg-gray-200" />
          <div className="h-8 w-56 rounded-full bg-gray-200" />
          <div className="h-4 w-full max-w-xl rounded-full bg-gray-100" />
        </div>
      </div>

      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex animate-pulse flex-col gap-4">
            <div className="h-5 w-36 rounded-full bg-gray-200" />
            <div className="h-4 w-full rounded-full bg-gray-100" />
            <div className="h-4 w-2/3 rounded-full bg-gray-100" />
          </div>
        </div>
      ))}
    </section>
  );
}

function getInitial(user: CurrentUser | null) {
  const label = user?.name || user?.email || "U";
  return label.slice(0, 1).toUpperCase();
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          setUser(null);
          return;
        }

        const json = await response.json();
        setUser(json.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    setSigningOut(false);
    router.push("/signin");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef2ff,#fafafb_42%,#f8fafc)]">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white">
                LC
              </span>
              <span>
                <span className="block text-base font-bold text-textPrimary">
                  Home
                </span>
                <span className="block text-xs text-textSecondary">
                  {loading ? "Loading workspace" : user ? "Workspace" : "Public access"}
                </span>
              </span>
            </Link>

            <div className="rounded-2xl bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary sm:hidden">
              180 problems
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <div className="hidden rounded-2xl bg-primary/5 px-4 py-2 text-sm font-medium text-primary sm:block">
              <span className="font-semibold text-textPrimary">180</span> problems
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-textSecondary">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Loading...
              </div>
            ) : user ? (
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-primary shadow-sm">
                    {getInitial(user)}
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold text-textPrimary">
                      {user.name || user.email}
                    </p>
                    <p className="truncate text-xs text-textSecondary">
                      {user.role === "admin" ? "Admin" : "Member"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="shrink-0 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-textPrimary transition hover:border-primary hover:text-primary disabled:opacity-60"
                >
                  {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/signin"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primaryHover"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-primary hover:text-primary"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
        {loading ? (
          <HomeLoader />
        ) : user ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <NavCard
              title="Start Mock"
              description="Run your main recall session and test what you still remember."
              href="/mock"
              featured
            />
            <NavCard
              title="Dashboard"
              description="View coverage and jump into shown or not-shown problem lists."
              href="/dashboard"
            />
            <NavCard
              title="Progress Tracker"
              description="Log problems solved today or on any chosen date."
              href="/progress"
              tone="cool"
            />
            <NavCard
              title="Articles"
              description="Read published revision articles or manage your own drafts."
              href="/articles"
              tone="warm"
            />
            <NavCard
              title="Add Problems"
              description="Add one problem or bulk insert into your problem bank."
              href="/problems/add"
            />
            {user.role === "admin" && (
              <NavCard
                title="Admin Hub"
                description="Edit, delete, and administer problems from the admin panel."
                href="/admin"
              />
            )}
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            <NavCard
              title="Articles"
              description="Browse public revision articles before signing in."
              href="/articles"
              tone="warm"
            />
            <NavCard
              title="Create Account"
              description="Sign up to unlock mocks, progress tracking, and private drafts."
              href="/signup"
              featured
            />
          </section>
        )}
      </div>
    </main>
  );
}

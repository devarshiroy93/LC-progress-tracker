import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

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

    loadUser();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    setSigningOut(false);
    router.push("/signin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg">
      <div className="text-center space-y-8 max-w-sm">
        <h1 className="text-2xl font-semibold text-primary">
          DSA Recall
        </h1>

        <p className="text-sm text-textSecondary">
          A minimal recall app for already-solved LeetCode problems.
        </p>

        <p className="text-sm text-textSecondary">
          Total problems:{" "}
          <span className="text-textPrimary font-medium">180</span> and counting
        </p>

        <div className="space-y-3">
          {loading ? (
            <div className="w-full rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-textSecondary">
              Checking session...
            </div>
          ) : user ? (
            <>
              <button
                className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primaryHover active:scale-[0.98]"
                onClick={() => router.push("/mock")}
              >
                Start Mock
              </button>

              <Link
                href="/dashboard"
                className="block text-sm font-medium text-primary hover:underline"
              >
                View Dashboard
              </Link>

              <Link
                href="/articles"
                className="block text-sm font-medium text-primary hover:underline"
              >
                Articles
              </Link>

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="block text-sm font-medium text-primary hover:underline"
                >
                  Admin Hub
                </Link>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="text-sm font-medium text-textSecondary hover:text-primary disabled:opacity-60"
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <button
                className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primaryHover active:scale-[0.98]"
                onClick={() => router.push("/signin")}
              >
                Sign in to Continue
              </button>

              <Link
                href="/signup"
                className="block text-sm font-medium text-primary hover:underline"
              >
                Create Account
              </Link>

              <Link
                href="/articles"
                className="block text-sm font-medium text-primary hover:underline"
              >
                Articles
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

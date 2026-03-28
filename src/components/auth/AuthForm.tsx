import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

type AuthMode = "signin" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Authentication failed");
      }

      router.push("/dashboard");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Authentication failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-textSecondary">
            DSA Recall
          </p>
          <h1 className="text-3xl font-semibold text-textPrimary">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-textSecondary">
            {isSignup
              ? "Create an account to track your recall sessions and revision notes."
              : "Sign in to continue your problem practice and revision flow."}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {isSignup && (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-textPrimary">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Your name"
              />
            </label>
          )}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-textPrimary">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-textPrimary">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={isSignup ? "At least 8 characters" : "Your password"}
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primaryHover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? isSignup
                ? "Creating account..."
                : "Signing in..."
              : isSignup
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-textSecondary">
          {isSignup ? "Already have an account?" : "Need an account?"}{" "}
          <Link
            href={isSignup ? "/signin" : "/signup"}
            className="font-medium text-primary hover:underline"
          >
            {isSignup ? "Sign in" : "Create one"}
          </Link>
        </p>
      </div>
    </div>
  );
}

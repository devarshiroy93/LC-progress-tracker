import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
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
          Total problems: <span className="text-textPrimary font-medium">180</span> and counting
        </p>

        <button
          className="
            w-full
            px-6 py-3
            rounded-xl
            bg-primary
            text-white
            text-sm
            font-semibold
            hover:bg-primaryHover
            active:scale-[0.98]
            transition
          "
          onClick={() => router.push("/mock")}
        >
          Start Mock
        </button>

      </div>
    </div>
  );
}

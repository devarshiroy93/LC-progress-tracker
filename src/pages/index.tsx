export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50">
      <div className="text-center space-y-8 max-w-sm">

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-sky-600">
          DSA Recall
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed">
          A minimal recall app for already-solved LeetCode problems.
        </p>

        {/* Count */}
        <p className="text-gray-500 text-sm">
          Total problems: <span className="font-medium">180</span> and counting
        </p>

        {/* Primary Action */}
        <button
          className="
            w-full
            px-6 py-3
            rounded-xl
            bg-sky-500
            text-white
            text-sm
            font-semibold
            shadow-sm
            hover:bg-sky-600
            active:scale-[0.98]
            transition
          "
        >
          Start Mock
        </button>

      </div>
    </div>
  );
}

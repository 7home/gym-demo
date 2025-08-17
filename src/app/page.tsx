export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Welcome to Gym Demo</h1>
      <a
        href="/app"
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Go to App
      </a>
    </main>
  );
}
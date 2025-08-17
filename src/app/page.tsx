export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="max-w-xl w-full text-center space-y-4">
        <h1 className="text-3xl font-bold">Antmann Gym App Demo Sasa – Hello World</h1>
        <p className="text-gray-600">Next.js + Tailwind běží ✔️</p>
        <a className="px-4 py-2 rounded bg-black text-white inline-block" href="/api/health">
          API health check
        </a>
      </div>
    </main>
  );
}
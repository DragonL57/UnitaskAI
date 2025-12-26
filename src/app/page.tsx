import Chat from '@/components/Chat';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Unitask AI</h1>
          <p className="mt-2 text-lg text-gray-600">Your personal multi-agent chatbot companion.</p>
        </header>
        
        <Chat />
        
        <footer className="text-center text-sm text-gray-500 pb-4">
          Built for personal use. Multi-agent architecture powered by Poe API.
        </footer>
      </div>
    </main>
  );
}
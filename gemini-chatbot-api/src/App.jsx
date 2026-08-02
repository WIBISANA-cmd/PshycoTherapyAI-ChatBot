import { AnimatePresence } from 'framer-motion';
import useChat from './useChat';
import Welcome from './components/Welcome';
import MessageList from './components/MessageList';
import Composer from './components/Composer';
import CrisisBanner from './components/CrisisBanner';

export default function App() {
  const { messages, streaming, crisis, send, reset, dismissCrisis } = useChat();

  return (
    <div className="flex h-dvh flex-col bg-linear-to-b from-sky-50 via-sky-50/40 to-white">
      <header className="sticky top-0 z-10 border-b border-sky-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div
            aria-hidden
            className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-sky-400 to-sky-600 text-lg shadow-sm shadow-sky-200"
          >
            💙
          </div>
          <div className="flex-1">
            <h1 className="font-semibold leading-tight text-slate-900">PshycoTherapyAI</h1>
            <p className="text-xs text-slate-400">
              {streaming ? 'Sedang mengetik…' : 'Siap mendengarkan kapan pun'}
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={reset}
              className="rounded-xl border border-sky-200 px-3 py-1.5 text-sm font-medium text-sky-700 transition hover:bg-sky-50 active:scale-95"
            >
              Sesi baru
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>{crisis && <CrisisBanner onClose={dismissCrisis} />}</AnimatePresence>

      {messages.length === 0 ? (
        <Welcome onPick={send} />
      ) : (
        <MessageList messages={messages} streaming={streaming} />
      )}

      <Composer onSend={send} disabled={streaming} />
    </div>
  );
}

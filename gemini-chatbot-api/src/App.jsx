import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Landing from './landing/Landing';

// Landing adalah halaman masuk — jangan ikut memuat bundel chat di sana.
const Chat = lazy(() => import('./components/Chat'));

// Dua halaman saja, jadi cukup baca location.hash — tidak perlu router.
const pageOf = (hash) => (hash === '#/chat' ? 'chat' : 'landing');

export default function App() {
  const [page, setPage] = useState(() => pageOf(window.location.hash));
  const prev = useRef(page);

  useEffect(() => {
    const onHash = () => {
      const next = pageOf(window.location.hash);
      if (next === prev.current) return; // anchor dalam halaman — jangan reset scroll
      prev.current = next;
      window.scrollTo(0, 0);
      setPage(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (page !== 'chat') return <Landing />;
  return (
    <Suspense
      fallback={
        <div className="grid h-dvh place-items-center bg-sky-50">
          <img src="/logo-mark.png" alt="" width="56" height="56" className="animate-pulse" />
        </div>
      }
    >
      <Chat />
    </Suspense>
  );
}

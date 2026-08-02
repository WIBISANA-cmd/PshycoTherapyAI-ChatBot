import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MAX_REC_SECONDS, mmss, pickRecorderMime, toAttachment } from '../attach';

/** Merekam voice note. onDone(attachment) saat dikirim, onError(pesan) saat gagal. */
export default function Recorder({ active, onStart, onCancel, onDone, onError }) {
  const [secs, setSecs] = useState(0);
  const ref = useRef({}); // { recorder, stream, chunks, keep }

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  // Batas durasi: menjaga ukuran unggahan tetap wajar sekaligus mencegah rekaman
  // yang tidak sengaja jalan terus.
  useEffect(() => {
    if (secs >= MAX_REC_SECONDS) stop(true);
  }, [secs]); // eslint-disable-line react-hooks/exhaustive-deps

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickRecorderMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (!ref.current.keep) return;
        try {
          onDone(await toAttachment(new Blob(chunks, { type: recorder.mimeType }), 'Pesan suara'));
        } catch {
          onError('Gagal memproses rekaman. Coba lagi ya.');
        }
      };
      ref.current = { recorder, stream, keep: false };
      recorder.start();
      setSecs(0);
      onStart();
    } catch {
      onError('Mikrofon tidak bisa diakses. Izinkan akses mikrofon di browser lalu coba lagi.');
    }
  }

  function stop(keep) {
    const { recorder } = ref.current;
    if (!recorder || recorder.state === 'inactive') return;
    ref.current.keep = keep;
    recorder.stop(); // lampiran menyusul lewat onDone di handler onstop
    onCancel(); // keluar dari mode merekam
  }

  if (!active)
    return (
      <button
        type="button"
        onClick={start}
        aria-label="Rekam pesan suara"
        title="Rekam pesan suara"
        className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-sky-50 hover:text-sky-600"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
          <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3z" />
          <path d="M17.3 11a.7.7 0 011.4 0 6.7 6.7 0 01-6 6.66V21h-1.4v-3.34a6.7 6.7 0 01-6-6.66.7.7 0 111.4 0 5.3 5.3 0 0010.6 0z" />
        </svg>
      </button>
    );

  return (
    <div className="flex flex-1 items-center gap-3 px-2">
      <motion.span
        aria-hidden
        className="size-2.5 shrink-0 rounded-full bg-rose-500"
        animate={{ opacity: [1, 0.25, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <span className="font-mono text-sm tabular-nums text-slate-600" role="timer" aria-live="off">
        {mmss(secs)}
      </span>
      <span className="flex-1 text-sm text-slate-400">Sedang merekam… ceritakan saja</span>
      <button
        type="button"
        onClick={() => stop(false)}
        className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100"
      >
        Batal
      </button>
      <button
        type="button"
        onClick={() => stop(true)}
        className="rounded-xl bg-sky-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-sky-700 active:scale-95"
      >
        Selesai
      </button>
    </div>
  );
}

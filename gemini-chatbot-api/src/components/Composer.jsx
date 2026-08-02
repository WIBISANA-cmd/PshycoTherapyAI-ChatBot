import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Recorder from './Recorder';
import { MAX_FILES, dataUrl, toAttachment, validateImages } from '../attach';

export default function Composer({ onSend, disabled }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);
  const picker = useRef(null);

  const grow = (el) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  async function addImages(list) {
    const { accepted, error: err } = validateImages(list, files.length);
    setError(err);
    if (!accepted.length) return;
    const next = await Promise.all(accepted.map((f) => toAttachment(f, f.name)));
    setFiles((prev) => [...prev, ...next]);
  }

  const submit = (e) => {
    e?.preventDefault();
    if (disabled || recording || (!text.trim() && files.length === 0)) return;
    onSend(text, files);
    setText('');
    setFiles([]);
    setError('');
    if (ref.current) ref.current.style.height = 'auto';
  };

  const canSend = !disabled && !recording && (text.trim() || files.length > 0);

  return (
    <div className="sticky bottom-0 border-t border-sky-100 bg-white/85 backdrop-blur-md">
      <form onSubmit={submit} className="mx-auto max-w-3xl px-4 pt-3">
        {/* Pratinjau lampiran */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 flex flex-wrap gap-2 overflow-hidden"
            >
              {files.map((f, i) => (
                <motion.li
                  key={i}
                  layout
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="group relative flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50/60 py-1.5 pl-1.5 pr-8"
                >
                  {f.kind === 'image' ? (
                    <img src={dataUrl(f)} alt={f.name} className="size-10 rounded-lg object-cover" />
                  ) : (
                    <span aria-hidden className="grid size-10 place-items-center rounded-lg bg-sky-100 text-lg">
                      🎙️
                    </span>
                  )}
                  <span className="max-w-40 truncate text-xs text-slate-600">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                    aria-label={`Hapus lampiran ${f.name}`}
                    className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-white text-xs text-slate-400 shadow-sm transition hover:text-rose-600"
                  >
                    ✕
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-1 rounded-2xl border border-sky-200 bg-white p-2 shadow-sm transition focus-within:border-sky-400 focus-within:shadow-md focus-within:shadow-sky-100">
          {!recording && (
            <>
              <input
                ref={picker}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/heic"
                multiple
                hidden
                onChange={(e) => {
                  addImages(e.target.files);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => picker.current?.click()}
                disabled={files.length >= MAX_FILES}
                aria-label="Lampirkan screenshot"
                title="Lampirkan screenshot (bisa juga tempel dengan Ctrl/Cmd+V)"
                className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-sky-50 hover:text-sky-600 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                  <path d="M16.5 6.5v9a4.5 4.5 0 01-9 0V5a3 3 0 116 0v9.5a1.5 1.5 0 11-3 0V6.5H9V14.5a3 3 0 006 0V5a4.5 4.5 0 10-9 0v10.5a6 6 0 0012 0v-9h-1.5z" />
                </svg>
              </button>
            </>
          )}

          <Recorder
            active={recording}
            onStart={() => {
              setRecording(true);
              setError('');
            }}
            onCancel={() => setRecording(false)}
            onDone={(a) => setFiles((p) => [...p, a])}
            onError={(m) => {
              setRecording(false);
              setError(m);
            }}
          />

          {!recording && (
            <>
              <textarea
                ref={ref}
                rows={1}
                value={text}
                aria-label="Tulis pesanmu"
                placeholder="Ceritakan apa yang sedang kamu rasakan…"
                onChange={(e) => {
                  setText(e.target.value);
                  grow(e.target);
                }}
                onPaste={(e) => {
                  // Alur paling natural untuk screenshot: potret layar lalu Ctrl/Cmd+V
                  if (e.clipboardData.files.length) {
                    e.preventDefault();
                    addImages(e.clipboardData.files);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) submit(e);
                }}
                className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 leading-relaxed placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Kirim pesan"
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-600 text-white transition hover:bg-sky-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:active:scale-100"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                  <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.99.99 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
                </svg>
              </button>
            </>
          )}
        </div>

        {error && (
          <p role="alert" className="px-1 pt-1.5 text-xs text-rose-600">
            {error}
          </p>
        )}

        <p className="px-1 py-2 text-center text-[11px] leading-snug text-slate-400">
          PshycoTherapyAI adalah teman bercerita berbasis AI, <strong className="font-semibold">bukan pengganti</strong>{' '}
          psikolog atau psikiater berlisensi. Dalam keadaan darurat hubungi 119 ext. 8.
        </p>
      </form>
    </div>
  );
}

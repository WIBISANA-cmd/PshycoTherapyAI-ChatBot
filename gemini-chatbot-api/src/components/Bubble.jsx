import { motion } from 'framer-motion';
import Markdown from 'react-markdown';
import { dataUrl } from '../attach';
import Logo from './Logo';

// Lampiran dari sesi lama tidak menyimpan base64 (lihat useChat.js), jadi tampilkan chip saja.
function Attachment({ file }) {
  if (!file.data)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2 py-1 text-xs">
        {file.kind === 'audio' ? '🎙️' : '🖼️'} {file.name}
      </span>
    );
  if (file.kind === 'audio')
    return <audio controls src={dataUrl(file)} className="h-10 w-56 max-w-full" />;
  return (
    <a href={dataUrl(file)} target="_blank" rel="noreferrer">
      <img
        src={dataUrl(file)}
        alt={file.name}
        className="max-h-64 rounded-xl border border-white/20 object-contain transition hover:opacity-90"
      />
    </a>
  );
}

export default function Bubble({ role, text, files, streaming }) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && <Logo className="mb-0.5 size-8 shrink-0" />}

      <div
        className={
          isUser
            ? 'max-w-[85%] rounded-2xl rounded-br-md bg-sky-600 px-4 py-2.5 text-white shadow-sm sm:max-w-[75%]'
            : 'md max-w-[85%] rounded-2xl rounded-bl-md border border-sky-100 bg-white px-4 py-3 shadow-sm shadow-sky-100/60 sm:max-w-[75%]'
        }
      >
        {files?.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${text ? 'mb-2' : ''}`}>
            {files.map((f, i) => (
              <Attachment key={i} file={f} />
            ))}
          </div>
        )}
        {isUser ? (
          text && <p className="whitespace-pre-wrap wrap-break-word">{text}</p>
        ) : (
          <>
            <Markdown>{text}</Markdown>
            {streaming && (
              <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-sky-500" />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

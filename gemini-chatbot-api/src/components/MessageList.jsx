import { useEffect, useRef } from 'react';
import Bubble from './Bubble';
import Typing from './Typing';

export default function MessageList({ messages, streaming }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, streaming]);

  const last = messages.at(-1);
  const waiting = streaming && last?.role === 'model' && last.text === '';

  return (
    <div className="scroll-soft flex-1 overflow-y-auto overscroll-contain">
      <div
        aria-live="polite"
        aria-relevant="additions text"
        className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6"
      >
        {messages.map((m, i) =>
          waiting && i === messages.length - 1 ? null : (
            <Bubble
              key={i}
              role={m.role}
              text={m.text}
              files={m.files}
              streaming={streaming && i === messages.length - 1 && m.role === 'model'}
            />
          )
        )}
        {waiting && <Typing />}
        <div ref={endRef} />
      </div>
    </div>
  );
}

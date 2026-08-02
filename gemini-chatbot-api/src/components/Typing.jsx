import { motion } from 'framer-motion';
import Logo from './Logo';

export default function Typing() {
  return (
    <div className="flex items-end gap-2">
      <Logo className="mb-0.5 size-8 shrink-0" />
      <div className="flex gap-1.5 rounded-2xl rounded-bl-md border border-sky-100 bg-white px-4 py-4 shadow-sm">
        <span className="sr-only">ShyTherAI sedang mengetik</span>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            aria-hidden
            className="size-2 rounded-full bg-sky-400"
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

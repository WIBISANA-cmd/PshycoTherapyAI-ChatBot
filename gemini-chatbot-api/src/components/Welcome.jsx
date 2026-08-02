import { motion } from 'framer-motion';
import Logo from './Logo';

const PROMPTS = [
  { icon: '😟', label: 'Saya sedang cemas', text: 'Aku lagi cemas banget dan susah menenangkan pikiran.' },
  { icon: '🌙', label: 'Susah tidur', text: 'Belakangan ini aku susah tidur, pikiranku ramai terus tiap malam.' },
  { icon: '🫥', label: 'Merasa sendirian', text: 'Aku merasa sendirian, kayak nggak ada yang benar-benar paham.' },
  { icon: '🔥', label: 'Lelah & burnout', text: 'Aku merasa kelelahan dan kehilangan semangat menjalani hari.' },
];

export default function Welcome({ onPick }) {
  return (
    <div className="scroll-soft flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-10 text-center sm:py-16">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Logo className="size-16" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl"
        >
          Hai, aku <span className="text-sky-600">ShyTherAI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-3 max-w-md text-balance leading-relaxed text-slate-500"
        >
          Ruang aman untuk bercerita, kapan pun kamu butuh. Tidak ada yang menghakimi di sini — mulai dari mana saja
          yang terasa paling ringan.
        </motion.p>

        <div className="mt-9 grid w-full gap-3 sm:grid-cols-2">
          {PROMPTS.map((p, i) => (
            <motion.button
              key={p.label}
              onClick={() => onPick(p.text)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3.5 text-left shadow-sm transition hover:border-sky-300 hover:shadow-md hover:shadow-sky-100"
            >
              <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-lg">
                {p.icon}
              </span>
              <span>
                <span className="block font-medium text-slate-800">{p.label}</span>
                <span className="block text-xs text-slate-400">Ketuk untuk mulai bercerita</span>
              </span>
            </motion.button>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 max-w-md rounded-xl bg-sky-50/70 px-4 py-3 text-xs leading-relaxed text-slate-500"
        >
          Aku bukan psikolog atau psikiater berlisensi dan tidak bisa memberi diagnosis maupun saran obat. Untuk kondisi
          yang berat, temui tenaga profesional.
        </motion.p>
      </div>
    </div>
  );
}

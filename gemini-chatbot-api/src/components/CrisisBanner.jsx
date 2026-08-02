import { motion } from 'framer-motion';

export default function CrisisBanner({ onClose }) {
  return (
    <motion.aside
      role="alert"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="border-b border-rose-200 bg-rose-50"
    >
      <div className="mx-auto flex max-w-3xl items-start gap-3 px-4 py-3">
        <span aria-hidden className="text-lg leading-none">🤝</span>
        <div className="flex-1 text-sm text-rose-900">
          <p className="font-semibold">Kamu tidak sendirian.</p>
          <p className="mt-1 leading-relaxed">
            Kalau kamu sedang berpikir untuk menyakiti diri sendiri, tolong hubungi bantuan sungguhan sekarang —{' '}
            <a className="font-semibold underline underline-offset-2" href="tel:119">
              119 ext. 8
            </a>{' '}
            (Layanan Sehat Jiwa Kemenkes) atau{' '}
            <a className="font-semibold underline underline-offset-2" href="tel:112">
              112
            </a>{' '}
            untuk keadaan darurat. Kabari juga satu orang yang kamu percaya malam ini.
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Tutup pesan bantuan darurat"
          className="rounded-lg px-2 py-1 text-rose-500 transition hover:bg-rose-100 hover:text-rose-700"
        >
          ✕
        </button>
      </div>
    </motion.aside>
  );
}

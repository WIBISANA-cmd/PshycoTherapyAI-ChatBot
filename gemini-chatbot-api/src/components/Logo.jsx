// Satu tempat untuk path logo, dipakai landing maupun chat.
export default function Logo({ className = 'size-9', alt = '' }) {
  return (
    <img
      src="/logo-mark.png"
      alt={alt}
      width="256"
      height="256"
      aria-hidden={alt ? undefined : true}
      className={`${className} object-contain`}
    />
  );
}

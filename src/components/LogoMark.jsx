export default function LogoMark({ src, alt, width = '100%', height = 'auto', className = '' }) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      style={{ objectFit: 'contain' }}
    />
  );
}

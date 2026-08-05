// 縫い目風の破線フレームを重ねた画像枠（下層ページ共通）
interface StitchedImageProps {
  src: string;
  alt: string;
  className?: string;
  tilt?: 'left' | 'right';
}

export default function StitchedImage({ src, alt, className = '', tilt = 'right' }: StitchedImageProps) {
  const tiltClass = tilt === 'right'
    ? 'rotate-2 translate-x-2 translate-y-2'
    : '-rotate-2 -translate-x-2 translate-y-2';

  return (
    <div className={`relative ${className}`}>
      <div
        className={`absolute inset-0 border-2 border-dashed border-orange-300 rounded-2xl ${tiltClass}`}
        aria-hidden="true"
      ></div>
      <img src={src} alt={alt} className="relative w-full h-full object-cover rounded-2xl" />
    </div>
  );
}

import { Link } from 'react-router-dom';

// 下層ページの最後に置く締めの CTA。写真は使わず、濃いオレンジの帯で目立たせる（2026-10-03）
interface CtaBandProps {
  title: string;
  text: string;
  primary: { to: string; label: string };
  secondary?: { to: string; label: string };
}

export default function CtaBand({ title, text, primary, secondary }: CtaBandProps) {
  return (
    <section className="rp-band-cta">
      <div className="rp-band-cta-inner">
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link to={primary.to} className="rp-btn rp-btn-on-orange">{primary.label}<i className="ri-arrow-right-line" aria-hidden="true"></i></Link>
          {secondary && <Link to={secondary.to} className="rp-btn rp-btn-ghost">{secondary.label}</Link>}
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';

// 写真の上に置く締めの CTA。下層ページの最後で使う
interface CtaBandProps {
  title: string;
  text: string;
  primary: { to: string; label: string };
  secondary?: { to: string; label: string };
  image?: string;
}

export default function CtaBand({ title, text, primary, secondary, image = '/images/repaw-dog.jpg' }: CtaBandProps) {
  return (
    <section className="rp-band-photo">
      <img src={image} alt="" loading="lazy" />
      <div className="rp-band-photo-inner">
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link to={primary.to} className="rp-btn rp-btn-white">{primary.label}</Link>
          {secondary && <Link to={secondary.to} className="rp-btn rp-btn-ghost">{secondary.label}</Link>}
        </div>
      </div>
    </section>
  );
}

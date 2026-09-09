// 下層ページ共通の見出し。トップの章見出しと同じ「英字の小見出し + 日本語見出し + 一文」
interface PageHeaderProps {
  eyebrow: string;   // 英字（例: About）
  title: string;     // 日本語の見出し
  lead?: string;     // 一文の説明
  align?: 'left' | 'center';
}

export default function PageHeader({ eyebrow, title, lead, align = 'left' }: PageHeaderProps) {
  return (
    <header className={`page-header ${align === 'center' ? 'page-header-center' : ''}`}>
      <p className="shop-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {lead && <p className="page-header-lead">{lead}</p>}
    </header>
  );
}

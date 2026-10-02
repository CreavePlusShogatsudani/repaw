import { Fragment, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

// 寄付サイト（donate.repaw.jp）からの申込。古物商の許可が下りるまでは無償の寄付だけ受け付ける
interface DonationSignup {
  id: string;
  name: string;
  email: string;
  item_count: string;
  address: string;
  instagram: string | null;
  thanks_consent: boolean;
  locale: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
}

const DONATION_STATUS: Record<string, { label: string; color: string }> = {
  new:       { label: '新規（要対応）',     color: 'bg-red-100 text-red-800' },
  contacted: { label: '送り先を案内済み',   color: 'bg-yellow-100 text-yellow-800' },
  received:  { label: '到着済み',         color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'キャンセル',       color: 'bg-gray-100 text-gray-600' },
};

const LOCALE_LABELS: Record<string, string> = { ja: '日本語', en: '英語', ko: '韓国語' };

// 'thanks' は状態ではなく、スペシャルサンクスに載せてよい人の絞り込み
const FILTERS = [
  ...Object.entries(DONATION_STATUS).map(([value, { label }]) => ({ value, label })),
  { value: 'thanks', label: 'スペシャルサンクス掲載OK' },
  { value: 'all', label: 'すべて' },
];

export default function AdminDonationsPage() {
  const [rows, setRows] = useState<DonationSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('new');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('donation_signups')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching donation signups:', error);
    setRows((data as DonationSignup[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  const update = async (row: DonationSignup, patch: Partial<DonationSignup>) => {
    setSaving(true);
    const { error } = await supabase
      .from('donation_signups')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', row.id);
    setSaving(false);
    if (error) { alert('更新に失敗しました。'); return; }
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
  };

  const setStatus = (row: DonationSignup, status: string, confirmText: string) => {
    if (!confirm(confirmText)) return;
    update(row, { status });
  };

  const toggle = (row: DonationSignup) => {
    if (expandedId === row.id) { setExpandedId(null); return; }
    setExpandedId(row.id);
    setNote(row.admin_note ?? '');
  };

  const thanksRows = rows.filter((r) => r.thanks_consent && r.instagram && r.status !== 'cancelled');
  const visible = filter === 'all' ? rows : filter === 'thanks' ? thanksRows : rows.filter((r) => r.status === filter);
  const newCount = rows.filter((r) => r.status === 'new').length;

  // スペシャルサンクスのページ作り用に、Instagram アカウントを改行区切りでまとめてコピー
  const copyThanks = async () => {
    await navigator.clipboard.writeText(thanksRows.map((r) => `@${r.instagram}`).join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">寄付の申込</h1>
          {newCount > 0 && (
            <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{newCount}件 要対応</span>
          )}
        </div>
        <button onClick={fetchRows} className="p-2 text-gray-500 hover:text-gray-900 transition-colors" title="更新">
          <i className="ri-refresh-line text-xl"></i>
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        寄付サイト（donate.repaw.jp）からの申込です。流れ: 新規 → 送り先をメールで案内 → 着払いで到着 → 検品して商品登録。日時は日本時間です。
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === value ? 'bg-gray-900 text-white' : 'bg-white border hover:bg-gray-50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {filter === 'thanks' && thanksRows.length > 0 && (
        <div className="mb-4 flex items-center gap-3 text-sm">
          <button onClick={copyThanks} className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700">
            <i className="ri-file-copy-line mr-1"></i>Instagram アカウントをまとめてコピー（{thanksRows.length}件）
          </button>
          {copied && <span className="text-green-700">コピーしました</span>}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-500">読み込み中...</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">該当する申込がありません</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">申込日時</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">お名前</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">点数</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Instagram</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ステータス</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((row) => {
                const st = DONATION_STATUS[row.status] ?? { label: row.status, color: 'bg-gray-100 text-gray-800' };
                return (
                  <Fragment key={row.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{new Date(row.created_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</td>
                      <td className="px-4 py-3 font-medium">{row.name}<span className="block text-xs text-gray-400 font-normal">{row.email}</span></td>
                      <td className="px-4 py-3 text-gray-600">{row.item_count}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.instagram ? `@${row.instagram}` : '-'}
                        {row.thanks_consent && <span className="block text-xs text-orange-700">掲載OK</span>}
                      </td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${st.color}`}>{st.label}</span></td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => toggle(row)} className="px-3 py-1 border text-xs rounded hover:bg-gray-50 whitespace-nowrap">
                          {expandedId === row.id ? '閉じる' : '詳細'}
                        </button>
                      </td>
                    </tr>

                    {expandedId === row.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-5">
                          <div className="grid md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-2">
                              <p><span className="text-gray-500">メール:</span> <a href={`mailto:${row.email}`} className="text-blue-600 hover:underline">{row.email}</a></p>
                              <p className="text-gray-500">ご住所:</p>
                              <p className="whitespace-pre-wrap bg-white border rounded p-3">{row.address}</p>
                              <p><span className="text-gray-500">申込時の言語:</span> {LOCALE_LABELS[row.locale ?? ''] ?? row.locale ?? '-'}</p>
                              <p><span className="text-gray-500">スペシャルサンクス掲載:</span> {row.thanks_consent ? '同意あり' : '同意なし'}</p>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-gray-500 mb-1">社内メモ（申込者には見えません）</label>
                                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} disabled={saving}
                                  className="w-full px-3 py-2 border rounded text-sm bg-white disabled:bg-gray-100"
                                  placeholder="例: 10/5 送り先を案内。10/8 5着到着" />
                                <button onClick={() => update(row, { admin_note: note.trim() || null })} disabled={saving}
                                  className="mt-1 px-3 py-1.5 border text-xs rounded bg-white hover:bg-gray-50 disabled:opacity-50">メモを保存</button>
                              </div>
                              <div className="flex flex-wrap gap-2 pt-2 border-t">
                                {row.status === 'new' && (
                                  <button onClick={() => setStatus(row, 'contacted', '送り先をメールで案内済みにしますか？')} disabled={saving}
                                    className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50">送り先を案内した</button>
                                )}
                                {(row.status === 'new' || row.status === 'contacted') && (
                                  <button onClick={() => setStatus(row, 'received', '寄付の品物が届いたことにしますか？')} disabled={saving}
                                    className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50">届いた</button>
                                )}
                                {row.status !== 'cancelled' && row.status !== 'received' && (
                                  <button onClick={() => setStatus(row, 'cancelled', 'この申込をキャンセルにしますか？')} disabled={saving}
                                    className="px-4 py-2 border text-sm rounded bg-white hover:bg-gray-50 disabled:opacity-50">キャンセル</button>
                                )}
                                {row.status !== 'new' && (
                                  <button onClick={() => setStatus(row, 'new', '新規（要対応）に戻しますか？')} disabled={saving}
                                    className="px-4 py-2 border text-sm rounded bg-white hover:bg-gray-50 disabled:opacity-50">新規に戻す</button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

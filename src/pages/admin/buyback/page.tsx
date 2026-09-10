import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { REQUEST_STATUS_ADMIN } from '../../../lib/buyback';

interface BuybackRow {
  id: string;
  name: string;
  email: string;
  status: string;
  payout_method: 'donate' | 'transfer' | null;
  created_at: string;
  received_at: string | null;
  item_count: number;
}

// 買取申込の一覧。査定の入力は詳細ページ（/admin/buyback/:id）で行う
const FILTERS: { value: string; label: string }[] = [
  { value: 'action', label: '要対応' },
  { value: 'all', label: 'すべて' },
  ...Object.entries(REQUEST_STATUS_ADMIN).filter(([v]) => v !== 'reviewing').map(([value, { label }]) => ({ value, label })),
];

// 管理者が次に動く必要があるステータス
const NEEDS_ACTION = ['pending', 'received', 'accepted'];

export default function AdminBuybackPage() {
  const [rows, setRows] = useState<BuybackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('action');

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('buyback_requests')
      .select('id, name, email, status, payout_method, created_at, received_at, buyback_items(count)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching buyback requests:', error);
    } else {
      setRows(((data as any[]) || []).map((r) => ({ ...r, item_count: r.buyback_items?.[0]?.count ?? 0 })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  const visible = rows.filter((r) =>
    filter === 'all' ? true : filter === 'action' ? NEEDS_ACTION.includes(r.status) : r.status === filter
  );
  const actionCount = rows.filter((r) => NEEDS_ACTION.includes(r.status)).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">買取申込管理</h1>
          {actionCount > 0 && (
            <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{actionCount}件 要対応</span>
          )}
        </div>
        <button onClick={fetchRows} className="p-2 text-gray-500 hover:text-gray-900 transition-colors" title="更新">
          <i className="ri-refresh-line text-xl"></i>
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">流れ: 申込 → ユーザーが着払いで発送 → 到着（スマホで撮影して1点ずつ査定）→ 査定額提示 → ユーザー回答 → 入金/寄付で完了</p>

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

      {loading ? (
        <div className="text-center py-16 text-gray-500">読み込み中...</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">該当する申込がありません</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">申込日</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">氏名</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ステータス</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">点数</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">受け取り</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">次にやること</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((r) => {
                const st = REQUEST_STATUS_ADMIN[r.status] ?? { label: r.status, color: 'bg-gray-100 text-gray-800' };
                const next: Record<string, string> = {
                  pending: '到着を待つ',
                  received: '撮影して査定する',
                  quoted: 'ユーザーの回答を待つ',
                  accepted: r.payout_method === 'transfer' ? '振り込む' : '寄付処理をする',
                };
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString('ja-JP')}</td>
                    <td className="px-4 py-3 font-medium">{r.name}<span className="block text-xs text-gray-400 font-normal">{r.email}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span></td>
                    <td className="px-4 py-3 text-gray-600">{r.item_count > 0 ? `${r.item_count}点` : '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.payout_method === 'donate' ? '寄付' : r.payout_method === 'transfer' ? '振込' : '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{next[r.status] || ''}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/buyback/${r.id}`} className="px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-700 whitespace-nowrap">開く</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

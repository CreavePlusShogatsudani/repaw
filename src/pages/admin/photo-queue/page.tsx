import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { itemDisplayName, type BuybackItem } from '../../../lib/buyback';

interface QueueRow extends BuybackItem {
  request: { id: string; name: string } | null;
  product: { id: string; name: string; status: string; images: string[] | null; price: number } | null;
}

// 撮影待ちリスト。買取が確定した服を一眼レフで撮り、下書き商品に写真を入れて公開するまでを追う
const TABS = [
  { value: 'awaiting_photo', label: '撮影待ち' },
  { value: 'photographed', label: '撮影済み（公開待ち）' },
  { value: 'listed', label: '販売中' },
];

export default function AdminPhotoQueuePage() {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('awaiting_photo');

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('buyback_items')
      .select('*, request:buyback_requests(id, name), product:products(id, name, status, images, price)')
      .in('status', ['awaiting_photo', 'photographed', 'listed'])
      .order('updated_at', { ascending: true });
    if (error) console.error('Error fetching photo queue:', error);
    setRows((data as unknown as QueueRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  const visible = rows.filter((r) => r.status === tab);
  const counts = Object.fromEntries(TABS.map((t) => [t.value, rows.filter((r) => r.status === t.value).length]));

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">撮影待ち</h1>
        <button onClick={fetchRows} className="p-2 text-gray-500 hover:text-gray-900 transition-colors" title="更新">
          <i className="ri-refresh-line text-xl"></i>
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">買取が確定した服です。一眼レフで撮影し、「商品を開く」から写真を入れると「撮影済み」に、公開すると「販売中」に自動で進みます。</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${tab === t.value ? 'bg-gray-900 text-white' : 'bg-white border hover:bg-gray-50'}`}>
            {t.label}{counts[t.value] > 0 && <span className="ml-1.5 text-xs opacity-80">{counts[t.value]}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">読み込み中...</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">該当する服はありません</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">査定写真</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">服</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">前のオーナー</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">商品（下書き）</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">販売価格</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="w-14 h-16 bg-gray-100 overflow-hidden rounded">
                      {r.intake_photos?.[0] && <img src={r.intake_photos[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{itemDisplayName(r)}</p>
                    <p className="text-xs text-gray-500">{[r.size_label && `サイズ ${r.size_label}`, r.rank && `${r.rank}ランク`].filter(Boolean).join(' · ')}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.request ? <Link to={`/admin/buyback/${r.request.id}`} className="hover:underline">{r.request.name}</Link> : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.product ? (
                      <>
                        <p>{r.product.name}</p>
                        <p className="text-xs text-gray-400">写真 {r.product.images?.length ?? 0}枚 · {r.product.status === 'published' ? '公開中' : r.product.status === 'draft' ? '下書き' : r.product.status}</p>
                      </>
                    ) : <span className="text-red-600 text-xs">下書き商品が未作成</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.product ? `¥${r.product.price.toLocaleString()}` : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    {r.product && (
                      <Link to={`/admin/products/${r.product.id}/edit`} className="px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-700 whitespace-nowrap">
                        {r.status === 'awaiting_photo' ? '商品を開く（写真を追加）' : r.status === 'photographed' ? '商品を開く（公開する）' : '商品を開く'}
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

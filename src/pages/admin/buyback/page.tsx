import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface BuybackRequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  item_type: string | null;
  item_description: string | null;
  condition: string | null;
  purchase_date: string | null;
  message: string | null;
  status: 'pending' | 'reviewing' | 'quoted' | 'accepted' | 'completed' | 'rejected';
  estimated_price: number | null;
  admin_note: string | null;
  instagram: string | null;
  created_at: string;
  payout_method: 'donate' | 'transfer' | null;
  bank_name: string | null;
  bank_branch: string | null;
  bank_account_type: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  user_responded_at: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: '未対応',       color: 'bg-yellow-100 text-yellow-800' },
  reviewing: { label: '査定中',       color: 'bg-blue-100 text-blue-800' },
  quoted:    { label: '査定額提示済み', color: 'bg-orange-100 text-orange-800' },
  accepted:  { label: 'ユーザー回答済み', color: 'bg-purple-100 text-purple-800' },
  completed: { label: '完了',         color: 'bg-green-100 text-green-800' },
  rejected:  { label: '対応不可',     color: 'bg-red-100 text-red-800' },
};

export default function AdminBuybackPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BuybackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ status: string; estimated_price: string; admin_note: string }>({
    status: '',
    estimated_price: '',
    admin_note: '',
  });

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('buyback_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching buyback requests:', error);
    } else {
      setRequests((data as BuybackRequest[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const startEdit = (req: BuybackRequest) => {
    setEditingId(req.id);
    setEditForm({
      status: req.status,
      estimated_price: req.estimated_price?.toString() || '',
      admin_note: req.admin_note || '',
    });
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from('buyback_requests')
      .update({
        status: editForm.status,
        estimated_price: editForm.estimated_price ? parseInt(editForm.estimated_price) : null,
        admin_note: editForm.admin_note || null,
      })
      .eq('id', id);

    if (error) {
      alert('更新に失敗しました。');
      return;
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: editForm.status as BuybackRequest['status'],
              estimated_price: editForm.estimated_price ? parseInt(editForm.estimated_price) : null,
              admin_note: editForm.admin_note || null,
            }
          : r
      )
    );
    setEditingId(null);
  };

  const needsAction = requests.filter(r => r.status === 'pending' || r.status === 'accepted');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">買取申込管理</h1>
          {needsAction.length > 0 && (
            <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {needsAction.length}件 要対応
            </span>
          )}
        </div>
        <button
          onClick={fetchRequests}
          className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
          title="更新"
        >
          <i className="ri-refresh-line text-xl"></i>
        </button>
      </div>

      {/* 要対応セクション */}
      {!loading && needsAction.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <h2 className="text-sm font-bold text-red-600">要対応 ({needsAction.length}件)</h2>
          </div>
          <div className="space-y-2">
            {needsAction.map(req => (
              <div key={req.id} className={`flex items-center justify-between px-4 py-3 rounded-lg border-l-4 bg-white shadow-sm ${req.status === 'accepted' ? 'border-purple-500' : 'border-red-400'}`}>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[req.status]?.color}`}>
                    {STATUS_LABELS[req.status]?.label}
                  </span>
                  <span className="text-sm font-medium">{req.name}</span>
                  <span className="text-xs text-gray-400">{req.item_type || '-'}</span>
                  {req.status === 'accepted' && req.payout_method && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${req.payout_method === 'donate' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {req.payout_method === 'donate' ? '寄付希望' : '振込希望'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString('ja-JP')}</span>
                  <button
                    onClick={() => { setExpandedId(req.id); document.getElementById(`req-${req.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                    className="text-xs px-3 py-1 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    対応する
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-500">読み込み中...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">買取申込がありません</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">申込日</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">氏名</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">カテゴリー</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">状態</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ステータス</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">査定金額</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map((req) => (
                <>
                  <tr key={req.id} id={`req-${req.id}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 font-medium">{req.name}</td>
                    <td className="px-4 py-3 text-gray-600">{req.item_type || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{req.condition || '-'}</td>
                    <td className="px-4 py-3">
                      {editingId === req.id ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_LABELS[req.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {STATUS_LABELS[req.status]?.label || req.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === req.id ? (
                        <input
                          type="number"
                          value={editForm.estimated_price}
                          onChange={(e) => setEditForm({ ...editForm, estimated_price: e.target.value })}
                          className="w-28 px-2 py-1 border rounded text-sm"
                          placeholder="例: 3000"
                        />
                      ) : (
                        <span className="font-medium">
                          {req.estimated_price != null ? `¥${req.estimated_price.toLocaleString()}` : '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {editingId === req.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(req.id)}
                              className="px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 border text-xs rounded hover:bg-gray-50"
                            >
                              キャンセル
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(req)}
                              className="px-3 py-1 border text-xs rounded hover:bg-gray-50"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                              className="px-3 py-1 border text-xs rounded hover:bg-gray-50"
                            >
                              {expandedId === req.id ? '閉じる' : '詳細'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* 詳細展開行 */}
                  {expandedId === req.id && (
                    <tr key={`${req.id}-detail`} className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid md:grid-cols-2 gap-6 text-sm">
                          <div className="space-y-2">
                            <p><span className="text-gray-500">メール:</span> <a href={`mailto:${req.email}`} className="text-blue-600 hover:underline">{req.email}</a></p>
                            <p><span className="text-gray-500">電話:</span> {req.phone || '-'}</p>
                            <p><span className="text-gray-500">住所:</span> {req.address || '-'}</p>
                            <p><span className="text-gray-500">購入時期:</span> {req.purchase_date || '-'}</p>
                            {req.instagram && (
                              <p className="flex items-center gap-1.5">
                                <span className="text-gray-500">Instagram:</span>
                                <a
                                  href={`https://www.instagram.com/${req.instagram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-pink-600 hover:underline flex items-center gap-1"
                                >
                                  <i className="ri-instagram-line"></i>
                                  @{req.instagram.replace('@', '')}
                                </a>
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <p><span className="text-gray-500">商品詳細:</span> {req.item_description || '-'}</p>
                            <p><span className="text-gray-500">その他ご要望:</span> {req.message || '-'}</p>
                          </div>
                        </div>

                        {/* ユーザー回答・口座情報 */}
                        {req.payout_method && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-bold mb-3">ユーザーの回答</p>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="text-gray-500">受け取り方法: </span>
                                {req.payout_method === 'donate'
                                  ? <span className="font-medium text-orange-600">全額寄付</span>
                                  : <span className="font-medium text-blue-600">口座振込</span>}
                              </p>
                              {req.payout_method === 'transfer' && (
                                <div className="bg-blue-50 rounded-lg p-4 space-y-1.5">
                                  <p><span className="text-gray-500">銀行名:</span> {req.bank_name}</p>
                                  <p><span className="text-gray-500">支店名:</span> {req.bank_branch}</p>
                                  <p><span className="text-gray-500">口座種別:</span> {req.bank_account_type}</p>
                                  <p><span className="text-gray-500">口座番号:</span> {req.bank_account_number}</p>
                                  <p><span className="text-gray-500">口座名義:</span> {req.bank_account_holder}</p>
                                </div>
                              )}
                              {req.user_responded_at && (
                                <p className="text-xs text-gray-400">回答日時: {new Date(req.user_responded_at).toLocaleString('ja-JP')}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 査定完了時：商品登録ボタン */}
                        {req.status === 'completed' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => {
                                const params = new URLSearchParams({
                                  from_buyback: req.id,
                                  ...(req.instagram ? { seller_instagram: req.instagram.replace('@', '') } : {}),
                                  ...(req.item_description ? { description: req.item_description } : {}),
                                  ...(req.item_type ? { category: req.item_type } : {}),
                                });
                                navigate(`/admin/products/new?${params.toString()}`);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                            >
                              <i className="ri-add-box-line"></i>
                              この買取から商品を登録する
                            </button>
                          </div>
                        )}

                        {/* 管理者メモ */}
                        {editingId === req.id ? (
                          <div className="mt-4">
                            <label className="block text-sm text-gray-600 mb-1">管理者メモ</label>
                            <textarea
                              value={editForm.admin_note}
                              onChange={(e) => setEditForm({ ...editForm, admin_note: e.target.value })}
                              rows={2}
                              className="w-full px-3 py-2 border rounded text-sm"
                              placeholder="社内用メモ（ユーザーには表示されません）"
                            />
                          </div>
                        ) : req.admin_note ? (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <span className="text-gray-500">管理者メモ: </span>{req.admin_note}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

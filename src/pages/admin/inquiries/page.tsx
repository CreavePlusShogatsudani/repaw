import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface Inquiry {
  id: string;
  user_id: string;
  order_id: string | null;
  subject: string;
  body: string;
  category: string | null;
  ai_draft: string | null;
  admin_edited_reply: string | null;
  status: 'received' | 'auto_sent' | 'pending_approval' | 'approved_sent';
  created_at: string;
  replied_at: string | null;
}

type InquiryWithEmail = Inquiry & { email: string | null };

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_approval: { label: '承認待ち',   color: 'bg-yellow-100 text-yellow-800' },
  received:         { label: 'AI未処理',   color: 'bg-red-100 text-red-800' },
  auto_sent:        { label: '自動送信済み', color: 'bg-green-100 text-green-800' },
  approved_sent:    { label: '承認送信済み', color: 'bg-blue-100 text-blue-800' },
};

const CATEGORY_LABELS: Record<string, string> = {
  question:  '質問',
  complaint: 'クレーム',
  refund:    '返品・返金',
  buyback:   '買取',
  other:     'その他',
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending_approval');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inquiries:', error);
      setLoading(false);
      return;
    }

    const rows = (data || []) as Inquiry[];

    // user_id から profiles のメールを別途取得
    const userIds = [...new Set(rows.map((r) => r.user_id))];
    const emailMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);
      profiles?.forEach((p: { id: string; email: string | null }) => {
        if (p.email) emailMap[p.id] = p.email;
      });
    }

    setInquiries(rows.map((r) => ({ ...r, email: emailMap[r.user_id] ?? null })));
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const openDetail = (inq: InquiryWithEmail) => {
    if (expandedId === inq.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(inq.id);
    setDraft(inq.admin_edited_reply ?? inq.ai_draft ?? '');
  };

  const approveAndSend = async (inq: InquiryWithEmail) => {
    const reply = draft.trim();
    if (!reply) {
      alert('回答本文を入力してください。');
      return;
    }
    if (!confirm('この内容で回答を送信しますか？')) return;

    setSaving(true);
    const edited = reply !== (inq.ai_draft ?? '');
    const repliedAt = new Date().toISOString();
    const { error } = await supabase
      .from('inquiries')
      .update({
        admin_edited_reply: edited ? reply : null,
        status: 'approved_sent',
        replied_at: repliedAt,
      })
      .eq('id', inq.id);
    setSaving(false);

    if (error) {
      alert('送信に失敗しました。');
      return;
    }
    // TODO(#21): 通知メール送信（「お問い合わせへの回答が届きました。マイページからご確認ください」）

    setInquiries((prev) =>
      prev.map((r) =>
        r.id === inq.id
          ? { ...r, admin_edited_reply: edited ? reply : null, status: 'approved_sent', replied_at: repliedAt }
          : r
      )
    );
    setExpandedId(null);
  };

  const pendingCount = inquiries.filter((r) => r.status === 'pending_approval' || r.status === 'received').length;
  const visible = filter === 'all' ? inquiries : inquiries.filter((r) => r.status === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">問い合わせ管理</h1>
          {pendingCount > 0 && (
            <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {pendingCount}件 要対応
            </span>
          )}
        </div>
        <button
          onClick={fetchInquiries}
          className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
          title="更新"
        >
          <i className="ri-refresh-line text-xl"></i>
        </button>
      </div>

      {/* ステータスフィルタ */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[...Object.entries(STATUS_LABELS).map(([value, { label }]) => ({ value, label })), { value: 'all', label: 'すべて' }].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === value ? 'bg-gray-900 text-white' : 'bg-white border hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">読み込み中...</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">該当する問い合わせがありません</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">受付日</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">メール</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">件名</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">分類</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">ステータス</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((inq) => (
                <>
                  <tr key={inq.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(inq.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{inq.email || '-'}</td>
                    <td className="px-4 py-3 font-medium">{inq.subject}</td>
                    <td className="px-4 py-3 text-gray-600">{inq.category ? CATEGORY_LABELS[inq.category] ?? inq.category : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_LABELS[inq.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABELS[inq.status]?.label || inq.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(inq)}
                        className="px-3 py-1 border text-xs rounded hover:bg-gray-50"
                      >
                        {expandedId === inq.id ? '閉じる' : '詳細'}
                      </button>
                    </td>
                  </tr>

                  {/* 詳細展開行 */}
                  {expandedId === inq.id && (
                    <tr key={`${inq.id}-detail`} className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="space-y-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">ユーザーの質問</p>
                            <p className="whitespace-pre-wrap bg-white border rounded p-3">{inq.body}</p>
                            {inq.order_id && (
                              <p className="text-xs text-gray-400 mt-1">関連注文: {inq.order_id.split('-')[0].toUpperCase()}</p>
                            )}
                          </div>

                          {inq.status === 'auto_sent' || inq.status === 'approved_sent' ? (
                            <div>
                              <p className="text-gray-500 mb-1">
                                送信済み回答
                                {inq.replied_at && <span className="text-xs text-gray-400 ml-2">{new Date(inq.replied_at).toLocaleString('ja-JP')}</span>}
                              </p>
                              <p className="whitespace-pre-wrap bg-white border rounded p-3">{inq.admin_edited_reply ?? inq.ai_draft}</p>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-gray-500 mb-1">
                                {inq.ai_draft ? 'AI下書き（編集して送信できます）' : '回答（AI下書きなし）'}
                              </label>
                              <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                rows={8}
                                disabled={saving}
                                className="w-full px-3 py-2 border rounded text-sm bg-white disabled:bg-gray-100"
                              />
                              <div className="mt-3">
                                <button
                                  onClick={() => approveAndSend(inq)}
                                  disabled={saving}
                                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                                >
                                  {saving ? '送信中...' : '承認して送信'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
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

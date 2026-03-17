import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // 権限付与モーダル
  const [showGrant, setShowGrant] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<AdminUser | null | 'not_found'>(null);
  const [searching, setSearching] = useState(false);
  const [granting, setGranting] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('is_admin', true)
      .order('created_at', { ascending: true });

    if (!error) setAdmins((data as AdminUser[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchResult(null);
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('email', searchEmail.trim())
      .single();

    setSearchResult(data ? (data as AdminUser) : 'not_found');
    setSearching(false);
  };

  const handleGrant = async () => {
    if (!searchResult || searchResult === 'not_found') return;
    setGranting(true);
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', searchResult.id);

    if (error) {
      alert('権限の付与に失敗しました。');
    } else {
      setShowGrant(false);
      setSearchEmail('');
      setSearchResult(null);
      fetchAdmins();
    }
    setGranting(false);
  };

  const handleRevoke = async (targetId: string) => {
    if (targetId === currentUser?.id) {
      alert('自分自身の管理者権限は削除できません。');
      return;
    }
    if (!confirm('この管理者の権限を削除しますか？')) return;

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: false })
      .eq('id', targetId);

    if (error) {
      alert('権限の削除に失敗しました。');
    } else {
      fetchAdmins();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">管理者アカウント</h1>
        <button
          onClick={() => { setShowGrant(true); setSearchEmail(''); setSearchResult(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          <i className="ri-user-add-line"></i>
          管理者を追加
        </button>
      </div>

      {/* 管理者一覧 */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">読み込み中...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">メールアドレス</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">氏名</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">登録日</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {admin.email}
                      {admin.id === currentUser?.id && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">自分</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{admin.full_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(admin.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-4 py-3">
                    {admin.id !== currentUser?.id && (
                      <button
                        onClick={() => handleRevoke(admin.id)}
                        className="px-3 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                      >
                        権限を削除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 管理者追加モーダル */}
      {showGrant && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">管理者を追加</h2>
              <button onClick={() => setShowGrant(false)} className="text-gray-400 hover:text-gray-600">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              あらかじめ <span className="font-medium">/signup</span> でユーザー登録を済ませてから、そのメールアドレスを入力してください。
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="メールアドレスを入力"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {searching ? '検索中...' : '検索'}
              </button>
            </div>

            {/* 検索結果 */}
            {searchResult === 'not_found' && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4">
                該当するユーザーが見つかりません。
              </div>
            )}
            {searchResult && searchResult !== 'not_found' && (
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm font-medium">{searchResult.email}</p>
                <p className="text-xs text-gray-500 mt-1">{searchResult.full_name || '氏名未設定'}</p>
                {admins.some(a => a.id === searchResult.id) ? (
                  <p className="text-xs text-orange-600 mt-2">このユーザーはすでに管理者です。</p>
                ) : (
                  <button
                    onClick={handleGrant}
                    disabled={granting}
                    className="mt-3 w-full py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {granting ? '付与中...' : 'このユーザーに管理者権限を付与する'}
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => setShowGrant(false)}
              className="w-full py-2 border text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

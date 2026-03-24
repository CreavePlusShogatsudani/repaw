import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface Member {
  id: string;
  email: string | null;
  full_name: string | null;
  pet_name: string | null;
  pet_breed: string | null;
  instagram_account: string | null;
  is_admin: boolean | null;
  created_at: string;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filtered, setFiltered] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, pet_name, pet_breed, instagram_account, is_admin, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMembers(data as Member[]);
        setFiltered(data as Member[]);
      }
      setLoading(false);
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered(members);
      return;
    }
    setFiltered(members.filter(m =>
      m.email?.toLowerCase().includes(q) ||
      m.full_name?.toLowerCase().includes(q) ||
      m.pet_name?.toLowerCase().includes(q) ||
      m.pet_breed?.toLowerCase().includes(q)
    ));
  }, [search, members]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">ユーザー一覧</h1>
          <p className="text-sm text-gray-500 mt-1">登録ユーザー {members.length} 名</p>
        </div>
      </div>

      {/* 検索 */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="メール・名前・ペット名で検索"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">該当するユーザーが見つかりません</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">メールアドレス</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">氏名</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">ペット</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Instagram</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">権限</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">登録日</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{member.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{member.full_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {member.pet_name
                        ? <span>{member.pet_name}{member.pet_breed ? <span className="text-gray-400 text-xs ml-1">（{member.pet_breed}）</span> : ''}</span>
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {member.instagram_account
                        ? <a href={`https://www.instagram.com/${member.instagram_account.replace('@', '').trim()}`} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline text-xs">@{member.instagram_account.replace('@', '').trim()}</a>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {member.is_admin
                        ? <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">管理者</span>
                        : <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">一般</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                      {new Date(member.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

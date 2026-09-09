import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { PreviousOwner } from '../../../types';

// 「あの子のおさがり」に出す前のオーナー（犬）の管理。
// 商品フォームの「前のオーナー」で商品に紐づける。
const EMPTY_FORM = { dog_name: '', instagram: '', story: '', is_featured: false, sort_order: 0 };

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState<PreviousOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchOwners = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('previous_owners')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setOwners((data as PreviousOwner[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchOwners(); }, []);

  // 画像圧縮（商品・バナーと同じルール: HEIC 拒否、最大1920px・5MB）
  const compressImage = (file: File): Promise<File> => new Promise((resolve, reject) => {
    const MAX_BYTES = 5 * 1024 * 1024;
    const MAX_SIZE = 1920;
    const lowerType = file.type.toLowerCase();
    const lowerName = file.name.toLowerCase();
    if (lowerType === 'image/heic' || lowerType === 'image/heif' || lowerName.endsWith('.heic') || lowerName.endsWith('.heif')) {
      reject(new Error('HEIC/HEIF形式の画像はアップロードできません。JPEG・PNG形式に変換してからお試しください。'));
      return;
    }
    if (file.size <= MAX_BYTES && file.type === 'image/jpeg') { resolve(file); return; }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('画像の読み込みに失敗しました。')); };
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      const tryCompress = (quality: number) => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          if (blob.size <= MAX_BYTES || quality <= 0.1) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
          } else {
            tryCompress(Math.max(quality - 0.1, 0.1));
          }
        }, 'image/jpeg', quality);
      };
      tryCompress(0.85);
    };
    img.src = objectUrl;
  });

  const uploadPhoto = async (file: File) => {
    const compressed = await compressImage(file);
    const fileName = `owners/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, compressed, { upsert: true, contentType: 'image/jpeg' });
    if (error) throw error;
    return supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
  };

  const openNew = () => {
    const maxOrder = owners.length > 0 ? Math.max(...owners.map((o) => o.sort_order)) + 1 : 0;
    setForm({ ...EMPTY_FORM, sort_order: maxOrder });
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditingId(null);
    setIsNew(true);
  };

  const openEdit = (owner: PreviousOwner) => {
    setForm({
      dog_name: owner.dog_name,
      instagram: owner.instagram || '',
      story: owner.story || '',
      is_featured: owner.is_featured,
      sort_order: owner.sort_order,
    });
    setPhotoFile(null);
    setPhotoPreview(owner.dog_photo_url);
    setEditingId(owner.id);
    setIsNew(false);
  };

  const closeForm = () => { setIsNew(false); setEditingId(null); };

  const handleSave = async () => {
    if (!form.dog_name.trim()) { alert('犬の名前を入力してください。'); return; }
    setSaving(true);
    try {
      let dogPhotoUrl = photoPreview;
      if (photoFile) dogPhotoUrl = await uploadPhoto(photoFile);
      const payload = {
        dog_name: form.dog_name.trim(),
        dog_photo_url: dogPhotoUrl,
        instagram: form.instagram.trim().replace(/^@/, '') || null,
        story: form.story.trim() || null,
        is_featured: form.is_featured,
        sort_order: form.sort_order,
        updated_at: new Date().toISOString(),
      };
      const { error } = editingId
        ? await supabase.from('previous_owners').update(payload).eq('id', editingId)
        : await supabase.from('previous_owners').insert(payload);
      if (error) throw error;
      closeForm();
      await fetchOwners();
    } catch (e) {
      alert((e as Error).message || '保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (owner: PreviousOwner) => {
    if (!confirm(`「${owner.dog_name}」を削除しますか？紐づいている商品の「前のオーナー」は未設定に戻ります。`)) return;
    const { error } = await supabase.from('previous_owners').delete().eq('id', owner.id);
    if (error) { alert('削除に失敗しました。'); return; }
    await fetchOwners();
  };

  const toggleFeatured = async (owner: PreviousOwner) => {
    const { error } = await supabase.from('previous_owners').update({ is_featured: !owner.is_featured, updated_at: new Date().toISOString() }).eq('id', owner.id);
    if (error) { alert('更新に失敗しました。'); return; }
    setOwners((prev) => prev.map((o) => o.id === owner.id ? { ...o, is_featured: !o.is_featured } : o));
  };

  const showForm = isNew || editingId !== null;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">おさがりオーナー</h1>
          <p className="text-sm text-gray-500 mt-1">商品に紐づける「前に着ていた子」。「特集に出す」をONにするとトップの「あの子のおさがり」に表示されます</p>
        </div>
        <button onClick={openNew} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 whitespace-nowrap">
          <i className="ri-add-line mr-1"></i>追加
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="font-bold mb-4">{editingId ? 'オーナーを編集' : 'オーナーを追加'}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">犬の名前 *</label>
                <input value={form.dog_name} onChange={(e) => setForm({ ...form, dog_name: e.target.value })} className="w-full p-3 border rounded-lg text-sm" placeholder="例: モカ" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">飼い主の Instagram</label>
                <div className="flex items-center">
                  <span className="px-3 py-3 bg-gray-100 border border-r-0 rounded-l-lg text-gray-500 text-sm">@</span>
                  <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value.replace(/^@/, '') })} className="w-full p-3 border rounded-r-lg text-sm" placeholder="instagram_username" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">一言</label>
                <textarea value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} rows={3} maxLength={120} className="w-full p-3 border rounded-lg text-sm" placeholder="例: 散歩のときにいつも着ていたお気に入りです" />
                <p className="text-xs text-gray-400 mt-1">{form.story.length}/120</p>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                  特集に出す
                </label>
                <label className="flex items-center gap-2 text-sm">
                  表示順
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="w-20 p-2 border rounded-lg text-sm" />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">犬の写真</label>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {photoPreview ? <img src={photoPreview} alt="" className="w-full h-full object-cover" /> : <i className="ri-image-line text-3xl text-gray-300"></i>}
                </div>
                <label className="px-4 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                  写真を選ぶ
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPhotoFile(file);
                    setPhotoPreview(URL.createObjectURL(file));
                  }} />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-2">正方形に近い写真だときれいに表示されます（自動で圧縮します）</p>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:bg-gray-400">{saving ? '保存中...' : '保存'}</button>
            <button onClick={closeForm} disabled={saving} className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50">キャンセル</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-500">読み込み中...</div>
      ) : owners.length === 0 ? (
        <div className="text-center py-16 text-gray-400">まだ登録がありません</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">犬</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Instagram</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">一言</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">特集</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">表示順</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {owners.map((owner) => (
                <tr key={owner.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {owner.dog_photo_url && <img src={owner.dog_photo_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-medium">{owner.dog_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{owner.instagram ? `@${owner.instagram}` : '-'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{owner.story || '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleFeatured(owner)} className={`px-2 py-1 rounded-full text-xs font-medium ${owner.is_featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}>
                      {owner.is_featured ? '特集に表示中' : '非表示'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{owner.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(owner)} className="px-3 py-1 border text-xs rounded hover:bg-gray-50">編集</button>
                      <button onClick={() => handleDelete(owner)} className="px-3 py-1 border text-xs rounded text-red-600 hover:bg-red-50">削除</button>
                    </div>
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

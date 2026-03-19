import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface Collection {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_url: string | null;
    tag: string | null;
    sort_order: number;
    is_active: boolean;
    product_count?: number;
}

const EMPTY_FORM = () => ({
    title: '',
    subtitle: '',
    description: '',
    cover_image_url: '',
    tag: '',
    sort_order: 0,
    is_active: true,
});

export default function AdminCollectionsPage() {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | 'new' | null>(null);
    const [form, setForm] = useState(EMPTY_FORM());
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('collections')
            .select('*, collection_products(count)')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error(error);
        } else {
            const mapped = (data || []).map((c: any) => ({
                ...c,
                product_count: c.collection_products?.[0]?.count ?? 0,
            }));
            setCollections(mapped);
        }
        setLoading(false);
    };

    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const MAX_BYTES = 5 * 1024 * 1024;
            const MAX_SIZE = 1920;
            const lowerType = file.type.toLowerCase();
            const lowerName = file.name.toLowerCase();
            if (lowerType === 'image/heic' || lowerType === 'image/heif' ||
                lowerName.endsWith('.heic') || lowerName.endsWith('.heif')) {
                reject(new Error('HEIC/HEIF形式の画像はアップロードできません。\nJPEG・PNG形式に変換してからお試しください。'));
                return;
            }
            if (file.size <= MAX_BYTES && file.type === 'image/jpeg') { resolve(file); return; }
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error(`画像の読み込みに失敗しました。`)); };
            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                let { width, height } = img;
                if (width > MAX_SIZE || height > MAX_SIZE) {
                    const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) { resolve(file); return; }
                ctx.drawImage(img, 0, 0, width, height);
                const tryCompress = (quality: number) => {
                    canvas.toBlob((blob) => {
                        if (!blob) { resolve(file); return; }
                        if (blob.size <= MAX_BYTES || quality <= 0.1) {
                            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
                        } else { tryCompress(Math.max(quality - 0.1, 0.1)); }
                    }, 'image/jpeg', quality);
                };
                tryCompress(0.85);
            };
            img.src = objectUrl;
        });
    };

    const uploadImage = async (file: File): Promise<string> => {
        const compressed = await compressImage(file);
        const fileName = `collection-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error } = await supabase.storage
            .from('product-images')
            .upload(fileName, compressed, { upsert: true, contentType: 'image/jpeg' });
        if (error) throw new Error(`アップロードに失敗しました: ${error.message}`);
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        return data.publicUrl;
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        e.target.value = '';
    };

    const openNew = () => {
        const maxOrder = collections.length > 0 ? Math.max(...collections.map(c => c.sort_order)) + 1 : 0;
        setForm({ ...EMPTY_FORM(), sort_order: maxOrder });
        setNewImageFile(null);
        setPreviewUrl(null);
        setEditingId('new');
    };

    const openEdit = (c: Collection) => {
        setForm({
            title: c.title,
            subtitle: c.subtitle || '',
            description: c.description || '',
            cover_image_url: c.cover_image_url || '',
            tag: c.tag || '',
            sort_order: c.sort_order,
            is_active: c.is_active,
        });
        setNewImageFile(null);
        setPreviewUrl(null);
        setEditingId(c.id);
    };

    const closeForm = () => {
        setEditingId(null);
        setPreviewUrl(null);
        setNewImageFile(null);
    };

    const handleSave = async () => {
        if (!form.title.trim()) { alert('タイトルを入力してください。'); return; }
        setSaving(true);
        try {
            let coverImageUrl = form.cover_image_url;
            if (newImageFile) {
                setUploadingImage(true);
                coverImageUrl = await uploadImage(newImageFile);
                setUploadingImage(false);
            }
            const payload = {
                title: form.title,
                subtitle: form.subtitle || null,
                description: form.description || null,
                cover_image_url: coverImageUrl || null,
                tag: form.tag || null,
                sort_order: form.sort_order,
                is_active: form.is_active,
                updated_at: new Date().toISOString(),
            };
            if (editingId === 'new') {
                const { data, error } = await supabase.from('collections').insert(payload).select('id').single();
                if (error) throw error;
                await fetchCollections();
                closeForm();
                // 作成後すぐに商品管理ページへ移動するか確認
                if (data?.id && confirm('コレクションを作成しました。続けて商品を追加しますか？')) {
                    navigate(`/admin/collections/${data.id}`);
                }
            } else {
                const { error } = await supabase.from('collections').update(payload).eq('id', editingId);
                if (error) throw error;
                await fetchCollections();
                closeForm();
            }
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : '保存に失敗しました。');
        } finally {
            setSaving(false);
            setUploadingImage(false);
        }
    };

    const toggleActive = async (c: Collection) => {
        const { error } = await supabase
            .from('collections')
            .update({ is_active: !c.is_active, updated_at: new Date().toISOString() })
            .eq('id', c.id);
        if (error) { alert('更新に失敗しました。'); return; }
        await fetchCollections();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('このコレクションを削除しますか？（商品の紐づけも削除されます）')) return;
        const { error } = await supabase.from('collections').delete().eq('id', id);
        if (error) { alert('削除に失敗しました。'); return; }
        await fetchCollections();
    };

    const moveOrder = async (index: number, direction: 'up' | 'down') => {
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= collections.length) return;
        const a = collections[index];
        const b = collections[swapIndex];
        await supabase.from('collections').update({ sort_order: b.sort_order }).eq('id', a.id);
        await supabase.from('collections').update({ sort_order: a.sort_order }).eq('id', b.id);
        await fetchCollections();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">おすすめ商品グループ管理</h1>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-700 transition-colors"
                >
                    <i className="ri-add-line"></i>
                    グループを作成
                </button>
            </div>

            <p className="text-sm text-gray-500 mb-6">
                商品グループを作成して、特集ページで表示します。各グループに商品を紐づけることができます。
            </p>

            {collections.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                    <i className="ri-folder-line text-4xl mb-3 block text-gray-300"></i>
                    グループがまだ作成されていません
                </div>
            ) : (
                <div className="space-y-4">
                    {collections.map((c, index) => (
                        <div key={c.id} className={`bg-white rounded-lg shadow overflow-hidden flex ${!c.is_active ? 'opacity-60' : ''}`}>
                            {/* Cover Image */}
                            <div className="w-40 h-28 flex-shrink-0 bg-gray-100">
                                {c.cover_image_url ? (
                                    <img src={c.cover_image_url} alt={c.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <i className="ri-image-line text-3xl"></i>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 p-4 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {c.tag && (
                                                <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full border border-orange-200">
                                                    {c.tag}
                                                </span>
                                            )}
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {c.is_active ? '公開中' : '非公開'}
                                            </span>
                                        </div>
                                        <p className="font-medium text-gray-900">{c.title}</p>
                                        {c.subtitle && <p className="text-xs text-gray-500 mt-0.5">{c.subtitle}</p>}
                                        <p className="text-sm text-orange-600 font-medium mt-1">{c.product_count}点の商品</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 mt-3">
                                    <button
                                        onClick={() => navigate(`/admin/collections/${c.id}`)}
                                        className="text-xs px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium transition-colors"
                                    >
                                        <i className="ri-shopping-bag-line mr-1"></i>商品を管理
                                    </button>
                                    <button
                                        onClick={() => openEdit(c)}
                                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                    >
                                        <i className="ri-edit-line mr-1"></i>編集
                                    </button>
                                    <button
                                        onClick={() => toggleActive(c)}
                                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                    >
                                        {c.is_active ? '非公開にする' : '公開する'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                    >
                                        <i className="ri-delete-bin-line mr-1"></i>削除
                                    </button>
                                    <div className="ml-auto flex gap-1">
                                        <button onClick={() => moveOrder(index, 'up')} disabled={index === 0}
                                            className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                                            <i className="ri-arrow-up-s-line text-lg"></i>
                                        </button>
                                        <button onClick={() => moveOrder(index, 'down')} disabled={index === collections.length - 1}
                                            className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">
                                            <i className="ri-arrow-down-s-line text-lg"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit / New Modal */}
            {editingId !== null && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-lg font-bold">
                                {editingId === 'new' ? 'グループを作成' : 'グループを編集'}
                            </h2>
                            <button onClick={closeForm} className="text-gray-400 hover:text-gray-700">
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Cover Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">カバー画像</label>
                                {(previewUrl || form.cover_image_url) && (
                                    <div className="mb-3 rounded overflow-hidden bg-gray-100 h-40">
                                        <img src={previewUrl || form.cover_image_url} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-gray-300 rounded py-4 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    <i className="ri-upload-cloud-line mr-2"></i>
                                    {previewUrl || form.cover_image_url ? '画像を変更する' : '画像をアップロード'}
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    タイトル <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="例: 冬のおすすめ特集"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                                />
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">サブタイトル（英語など）</label>
                                <input
                                    type="text"
                                    value={form.subtitle}
                                    onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                                    placeholder="例: Winter Collection"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">説明文</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="例: 寒い季節にぴったりな暖かい犬服を集めました"
                                    rows={3}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 resize-none"
                                />
                            </div>

                            {/* Tag & Sort */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
                                    <input
                                        type="text"
                                        value={form.tag}
                                        onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                                        placeholder="例: 新着・人気・おすすめ"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">表示順</label>
                                    <input
                                        type="number"
                                        value={form.sort_order}
                                        onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                                        min={0}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Active */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="col_is_active"
                                    checked={form.is_active}
                                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                                    className="w-4 h-4 accent-gray-900"
                                />
                                <label htmlFor="col_is_active" className="text-sm text-gray-700 cursor-pointer">
                                    公開する（特集ページ・トップページに表示）
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t bg-gray-50">
                            <button onClick={closeForm}
                                className="flex-1 px-4 py-2 border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                キャンセル
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors">
                                {saving ? (uploadingImage ? 'アップロード中...' : '保存中...') : '保存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

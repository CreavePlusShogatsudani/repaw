import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

interface HeroBanner {
    id: string;
    title: string | null;
    subtitle: string | null;
    image_url: string;
    link_url: string | null;
    link_text: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

const EMPTY_FORM = () => ({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    link_text: '',
    sort_order: 0,
    is_active: true,
});

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<HeroBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | 'new' | null>(null);
    const [form, setForm] = useState(EMPTY_FORM());
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('hero_banners')
            .select('*')
            .order('sort_order', { ascending: true });
        if (error) {
            console.error(error);
            alert('バナーの取得に失敗しました。');
        } else {
            setBanners(data || []);
        }
        setLoading(false);
    };

    // Canvas圧縮 (product form と同じロジック)
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
            if (file.size <= MAX_BYTES && file.type === 'image/jpeg') {
                resolve(file);
                return;
            }
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error(`画像の読み込みに失敗しました（${file.name}）。`));
            };
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
    };

    const uploadImage = async (file: File): Promise<string> => {
        const compressed = await compressImage(file);
        const fileName = `hero-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
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
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        e.target.value = '';
    };

    const openNew = () => {
        const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.sort_order)) + 1 : 0;
        setForm({ ...EMPTY_FORM(), sort_order: maxOrder });
        setNewImageFile(null);
        setPreviewUrl(null);
        setEditingId('new');
    };

    const openEdit = (banner: HeroBanner) => {
        setForm({
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            image_url: banner.image_url,
            link_url: banner.link_url || '',
            link_text: banner.link_text || '',
            sort_order: banner.sort_order,
            is_active: banner.is_active,
        });
        setNewImageFile(null);
        setPreviewUrl(null);
        setEditingId(banner.id);
    };

    const closeForm = () => {
        setEditingId(null);
        setPreviewUrl(null);
        setNewImageFile(null);
    };

    const handleSave = async () => {
        if (!form.image_url && !newImageFile) {
            alert('画像を選択してください。');
            return;
        }
        setSaving(true);
        try {
            let imageUrl = form.image_url;
            if (newImageFile) {
                setUploadingImage(true);
                imageUrl = await uploadImage(newImageFile);
                setUploadingImage(false);
            }

            const payload = {
                title: form.title || null,
                subtitle: form.subtitle || null,
                image_url: imageUrl,
                link_url: form.link_url || null,
                link_text: form.link_text || null,
                sort_order: form.sort_order,
                is_active: form.is_active,
                updated_at: new Date().toISOString(),
            };

            if (editingId === 'new') {
                const { error } = await supabase.from('hero_banners').insert(payload);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('hero_banners').update(payload).eq('id', editingId);
                if (error) throw error;
            }
            await fetchBanners();
            closeForm();
        } catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : '保存に失敗しました。';
            alert(msg);
        } finally {
            setSaving(false);
            setUploadingImage(false);
        }
    };

    const toggleActive = async (banner: HeroBanner) => {
        const { error } = await supabase
            .from('hero_banners')
            .update({ is_active: !banner.is_active, updated_at: new Date().toISOString() })
            .eq('id', banner.id);
        if (error) { alert('更新に失敗しました。'); return; }
        await fetchBanners();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('このバナーを削除しますか？')) return;
        const { error } = await supabase.from('hero_banners').delete().eq('id', id);
        if (error) { alert('削除に失敗しました。'); return; }
        await fetchBanners();
    };

    const moveOrder = async (index: number, direction: 'up' | 'down') => {
        const sorted = [...banners];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= sorted.length) return;

        const a = sorted[index];
        const b = sorted[swapIndex];
        const aOrder = a.sort_order;
        const bOrder = b.sort_order;

        await supabase.from('hero_banners').update({ sort_order: bOrder }).eq('id', a.id);
        await supabase.from('hero_banners').update({ sort_order: aOrder }).eq('id', b.id);
        await fetchBanners();
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
                <h1 className="text-2xl font-bold text-gray-900">メインビジュアル管理</h1>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-700 transition-colors"
                >
                    <i className="ri-add-line"></i>
                    バナーを追加
                </button>
            </div>

            <p className="text-sm text-gray-500 mb-6">
                トップページのメインビジュアルを管理します。複数登録した場合は自動でスライドショーになります。
            </p>

            {/* Banner List */}
            {banners.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                    <i className="ri-image-line text-4xl mb-3 block text-gray-300"></i>
                    バナーがまだ登録されていません
                </div>
            ) : (
                <div className="space-y-4">
                    {banners.map((banner, index) => (
                        <div key={banner.id} className={`bg-white rounded-lg shadow overflow-hidden flex ${!banner.is_active ? 'opacity-60' : ''}`}>
                            {/* Image Preview */}
                            <div className="w-48 h-32 flex-shrink-0 bg-gray-100">
                                <img
                                    src={banner.image_url}
                                    alt={banner.title || 'banner'}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 p-4 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {banner.title || <span className="text-gray-400 italic">タイトルなし</span>}
                                        </p>
                                        {banner.subtitle && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{banner.subtitle}</p>
                                        )}
                                        {banner.link_url && (
                                            <p className="text-xs text-blue-500 mt-1 truncate">
                                                <i className="ri-link mr-1"></i>{banner.link_url}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {banner.is_active ? '表示中' : '非表示'}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 mt-3">
                                    <button
                                        onClick={() => openEdit(banner)}
                                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                    >
                                        <i className="ri-edit-line mr-1"></i>編集
                                    </button>
                                    <button
                                        onClick={() => toggleActive(banner)}
                                        className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                    >
                                        {banner.is_active ? '非表示にする' : '表示する'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                    >
                                        <i className="ri-delete-bin-line mr-1"></i>削除
                                    </button>
                                    <div className="ml-auto flex gap-1">
                                        <button
                                            onClick={() => moveOrder(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="上に移動"
                                        >
                                            <i className="ri-arrow-up-s-line text-lg"></i>
                                        </button>
                                        <button
                                            onClick={() => moveOrder(index, 'down')}
                                            disabled={index === banners.length - 1}
                                            className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="下に移動"
                                        >
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
                                {editingId === 'new' ? 'バナーを追加' : 'バナーを編集'}
                            </h2>
                            <button onClick={closeForm} className="text-gray-400 hover:text-gray-700">
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    バナー画像 <span className="text-red-500">*</span>
                                </label>
                                {(previewUrl || form.image_url) && (
                                    <div className="mb-3 rounded overflow-hidden bg-gray-100 aspect-video">
                                        <img
                                            src={previewUrl || form.image_url}
                                            alt="preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-gray-300 rounded py-4 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    <i className="ri-upload-cloud-line mr-2 text-lg"></i>
                                    {previewUrl || form.image_url ? '画像を変更する' : '画像をアップロード'}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageSelect}
                                />
                                <p className="text-xs text-gray-400 mt-1">推奨: 横長画像（16:9）、JPEG/PNG形式</p>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    キャッチコピー（大見出し）
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="例: リユースで未来を創る"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                                />
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    サブテキスト
                                </label>
                                <textarea
                                    value={form.subtitle}
                                    onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                                    placeholder="例: 使わなくなった犬服を買い取り、新しい飼い主へ。"
                                    rows={3}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 resize-none"
                                />
                            </div>

                            {/* Link */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ボタンテキスト
                                    </label>
                                    <input
                                        type="text"
                                        value={form.link_text}
                                        onChange={e => setForm(f => ({ ...f, link_text: e.target.value }))}
                                        placeholder="例: 製品を見る"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ボタンリンク先
                                    </label>
                                    <input
                                        type="text"
                                        value={form.link_url}
                                        onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                                        placeholder="例: /products"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Sort Order & Active */}
                            <div className="flex items-center gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">表示順</label>
                                    <input
                                        type="number"
                                        value={form.sort_order}
                                        onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                                        min={0}
                                        className="w-20 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={form.is_active}
                                        onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                                        className="w-4 h-4 accent-gray-900"
                                    />
                                    <label htmlFor="is_active" className="text-sm text-gray-700 cursor-pointer">
                                        表示する
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t bg-gray-50">
                            <button
                                onClick={closeForm}
                                className="flex-1 px-4 py-2 border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                                {saving ? (uploadingImage ? 'アップロード中...' : '保存中...') : '保存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

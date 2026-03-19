import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

const CATEGORIES = ['お知らせ', '寄付報告', '新商品', 'イベント'];

const today = () => new Date().toISOString().slice(0, 16);

export default function AdminNewsFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('お知らせ');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [publishedAt, setPublishedAt] = useState(today());
    const [isPublished, setIsPublished] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEdit) fetchArticle();
    }, [id]);

    const fetchArticle = async () => {
        const { data, error } = await supabase
            .from('news_articles')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data) {
            alert('記事が見つかりませんでした。');
            navigate('/admin/news');
            return;
        }
        setTitle(data.title || '');
        setCategory(data.category || 'お知らせ');
        setExcerpt(data.excerpt || '');
        setContent(data.content || '');
        setThumbnailUrl(data.thumbnail_url || '');
        setPublishedAt(data.published_at ? data.published_at.slice(0, 16) : today());
        setIsPublished(data.is_published || false);
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
                reject(new Error('HEIC/HEIF形式はアップロードできません。JPEG・PNG形式に変換してください。'));
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
        const fileName = `news-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { alert('タイトルを入力してください。'); return; }
        setSaving(true);
        try {
            let imgUrl = thumbnailUrl;
            if (newImageFile) {
                setUploadingImage(true);
                imgUrl = await uploadImage(newImageFile);
                setUploadingImage(false);
            }
            const payload = {
                title,
                category,
                excerpt: excerpt || null,
                content: content || null,
                thumbnail_url: imgUrl || null,
                published_at: new Date(publishedAt).toISOString(),
                is_published: isPublished,
                updated_at: new Date().toISOString(),
            };
            if (isEdit) {
                const { error } = await supabase.from('news_articles').update(payload).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('news_articles').insert(payload);
                if (error) throw error;
            }
            navigate('/admin/news');
        } catch (err: any) {
            console.error(err);
            const msg = err?.message || err?.error_description || JSON.stringify(err);
            alert(`保存に失敗しました。\n\n${msg}`);
        } finally {
            setSaving(false);
            setUploadingImage(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/news" className="text-gray-400 hover:text-gray-700">
                    <i className="ri-arrow-left-line text-xl"></i>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? '記事を編集' : '記事を作成'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Thumbnail */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">サムネイル画像</h2>
                    {(previewUrl || thumbnailUrl) && (
                        <div className="mb-4 rounded overflow-hidden bg-gray-100 h-48">
                            <img src={previewUrl || thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded py-4 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <i className="ri-upload-cloud-line mr-2"></i>
                        {previewUrl || thumbnailUrl ? '画像を変更する' : '画像をアップロード'}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    {(previewUrl || thumbnailUrl) && (
                        <button
                            type="button"
                            onClick={() => { setPreviewUrl(null); setThumbnailUrl(''); setNewImageFile(null); }}
                            className="mt-2 text-xs text-red-500 hover:text-red-700"
                        >
                            画像を削除
                        </button>
                    )}
                </div>

                {/* Basic Info */}
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-700">基本情報</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            タイトル <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="記事タイトルを入力"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">公開日時</label>
                            <input
                                type="datetime-local"
                                value={publishedAt}
                                onChange={e => setPublishedAt(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            抜粋（一覧ページに表示する短い説明）
                        </label>
                        <textarea
                            value={excerpt}
                            onChange={e => setExcerpt(e.target.value)}
                            placeholder="記事の概要を2〜3文で入力してください"
                            rows={2}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 resize-none"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">本文</h2>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="記事の本文を入力してください。&#10;&#10;改行はそのまま反映されます。&#10;&#10;見出しを付けたい場合は行の先頭に「##」を付けてください。"
                        rows={20}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 resize-y font-mono"
                    />
                    <p className="text-xs text-gray-400 mt-2">改行はそのまま反映されます。「## 見出し」で見出しを作れます。</p>
                </div>

                {/* Publish */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={isPublished}
                            onChange={e => setIsPublished(e.target.checked)}
                            className="w-4 h-4 accent-gray-900"
                        />
                        <label htmlFor="is_published" className="text-sm font-medium text-gray-700 cursor-pointer">
                            公開する（チェックを外すと下書き保存）
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pb-8">
                    <Link
                        to="/admin/news"
                        className="flex-1 text-center px-4 py-3 border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        キャンセル
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-4 py-3 bg-gray-900 text-white text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                        {saving ? (uploadingImage ? 'アップロード中...' : '保存中...') : (isPublished ? '公開して保存' : '下書き保存')}
                    </button>
                </div>
            </form>
        </div>
    );
}

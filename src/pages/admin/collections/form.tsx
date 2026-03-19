import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface RecommendedItem {
    id: string;
    product_id: string;
    sort_order: number;
    product: {
        id: string;
        name: string;
        price: number;
        images: string[] | null;
        category: string;
    } | null;
}

function extractProductId(input: string): string | null {
    const match = input.match(/\/product\/([0-9a-f-]{36})/i);
    if (match) return match[1];
    const uuidMatch = input.trim().match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    if (uuidMatch) return input.trim();
    return null;
}

export default function AdminCollectionFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [tag, setTag] = useState('');
    const [sortOrder, setSortOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentImageInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [insertingContentImage, setInsertingContentImage] = useState(false);

    // おすすめ商品
    const [recItems, setRecItems] = useState<RecommendedItem[]>([]);
    const [recUrlInput, setRecUrlInput] = useState('');
    const [recAdding, setRecAdding] = useState(false);
    const [recError, setRecError] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit) {
            fetchCollection();
            fetchRecommended();
        }
    }, [id]);

    const fetchCollection = async () => {
        const { data, error } = await supabase
            .from('collections')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data) {
            alert('特集が見つかりませんでした。');
            navigate('/admin/collections');
            return;
        }
        setTitle(data.title || '');
        setSubtitle(data.subtitle || '');
        setDescription(data.description || '');
        setContent(data.content || '');
        setCoverImageUrl(data.cover_image_url || '');
        setTag(data.tag || '');
        setSortOrder(data.sort_order ?? 0);
        setIsActive(data.is_active ?? true);
        setLoading(false);
    };

    const fetchRecommended = async () => {
        const { data } = await supabase
            .from('recommended_products')
            .select('id, product_id, sort_order, product:products(id, name, price, images, category)')
            .eq('collection_id', id)
            .order('sort_order', { ascending: true });
        setRecItems((data as any) || []);
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

    const uploadImage = async (file: File, prefix = 'collection'): Promise<string> => {
        const compressed = await compressImage(file);
        const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
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

    // 本文への画像挿入
    const handleContentImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        setInsertingContentImage(true);
        try {
            const url = await uploadImage(file, 'content');
            const tag = `![](${url})`;
            const textarea = textareaRef.current;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newContent = content.slice(0, start) + '\n' + tag + '\n' + content.slice(end);
                setContent(newContent);
                // カーソルを画像タグの後に移動
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + tag.length + 2;
                    textarea.focus();
                }, 0);
            } else {
                setContent(prev => prev + '\n' + tag + '\n');
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : '画像のアップロードに失敗しました。');
        } finally {
            setInsertingContentImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { alert('タイトルを入力してください。'); return; }
        setSaving(true);
        try {
            let imgUrl = coverImageUrl;
            if (newImageFile) {
                setUploadingImage(true);
                imgUrl = await uploadImage(newImageFile);
                setUploadingImage(false);
            }
            const payload = {
                title,
                subtitle: subtitle || null,
                description: description || null,
                content: content || null,
                cover_image_url: imgUrl || null,
                tag: tag || null,
                sort_order: sortOrder,
                is_active: isActive,
                updated_at: new Date().toISOString(),
            };
            if (isEdit) {
                const { error } = await supabase.from('collections').update(payload).eq('id', id);
                if (error) throw error;
                navigate(`/admin/collections`);
            } else {
                const { data, error } = await supabase.from('collections').insert(payload).select('id').single();
                if (error) throw error;
                if (data?.id && confirm('特集を作成しました。続けて商品を追加しますか？')) {
                    navigate(`/admin/collections/${data.id}`);
                } else {
                    navigate('/admin/collections');
                }
            }
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : '保存に失敗しました。');
        } finally {
            setSaving(false);
            setUploadingImage(false);
        }
    };

    // おすすめ商品の追加
    const handleRecAdd = async () => {
        setRecError(null);
        const productId = extractProductId(recUrlInput);
        if (!productId) {
            setRecError('商品URLまたは商品IDを正しく入力してください');
            return;
        }
        if (recItems.some(i => i.product_id === productId)) {
            setRecError('この商品はすでに登録されています。');
            return;
        }
        setRecAdding(true);
        const { data: prod, error: prodErr } = await supabase
            .from('products').select('id, name').eq('id', productId).single();
        if (prodErr || !prod) {
            setRecError('商品が見つかりませんでした。');
            setRecAdding(false);
            return;
        }
        const nextOrder = recItems.length > 0 ? Math.max(...recItems.map(i => i.sort_order)) + 1 : 0;
        const { error } = await supabase.from('recommended_products')
            .insert({ collection_id: id, product_id: productId, sort_order: nextOrder });
        if (error) {
            setRecError('登録に失敗しました: ' + error.message);
            setRecAdding(false);
            return;
        }
        setRecUrlInput('');
        setRecAdding(false);
        await fetchRecommended();
    };

    const handleRecDelete = async (recId: string) => {
        if (!confirm('削除しますか？')) return;
        await supabase.from('recommended_products').delete().eq('id', recId);
        await fetchRecommended();
    };

    const moveRecOrder = async (index: number, direction: 'up' | 'down') => {
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= recItems.length) return;
        const a = recItems[index];
        const b = recItems[swapIndex];
        await supabase.from('recommended_products').update({ sort_order: b.sort_order }).eq('id', a.id);
        await supabase.from('recommended_products').update({ sort_order: a.sort_order }).eq('id', b.id);
        await fetchRecommended();
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
                <Link to="/admin/collections" className="text-gray-400 hover:text-gray-700">
                    <i className="ri-arrow-left-line text-xl"></i>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? '特集を編集' : '特集を作成'}
                </h1>
                {isEdit && (
                    <Link
                        to={`/admin/collections/${id}`}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 text-sm hover:bg-orange-100 transition-colors"
                    >
                        <i className="ri-shopping-bag-line"></i>商品を管理
                    </Link>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Cover Image */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">カバー画像</h2>
                    {(previewUrl || coverImageUrl) && (
                        <div className="mb-4 rounded overflow-hidden bg-gray-100 h-52">
                            <img src={previewUrl || coverImageUrl} alt="cover" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded py-4 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <i className="ri-upload-cloud-line mr-2"></i>
                        {previewUrl || coverImageUrl ? '画像を変更する' : '画像をアップロード'}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    <p className="text-xs text-gray-400 mt-1">推奨: 横長画像（16:9）、JPEG/PNG形式</p>
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
                            placeholder="例: 冬のおすすめ特集"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">サブタイトル（英語など）</label>
                        <input
                            type="text"
                            value={subtitle}
                            onChange={e => setSubtitle(e.target.value)}
                            placeholder="例: Winter Collection"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            概要（一覧ページに表示する短い説明）
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="例: 寒い季節にぴったりな暖かい犬服を集めました"
                            rows={2}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
                            <input
                                type="text"
                                value={tag}
                                onChange={e => setTag(e.target.value)}
                                placeholder="例: 新着・人気・おすすめ"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">表示順</label>
                            <input
                                type="number"
                                value={sortOrder}
                                onChange={e => setSortOrder(Number(e.target.value))}
                                min={0}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Article Content */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-700">記事本文</h2>
                        <button
                            type="button"
                            onClick={() => contentImageInputRef.current?.click()}
                            disabled={insertingContentImage}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs transition-colors disabled:opacity-50"
                        >
                            <i className="ri-image-add-line"></i>
                            {insertingContentImage ? 'アップロード中...' : '画像を挿入'}
                        </button>
                        <input
                            ref={contentImageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleContentImageSelect}
                        />
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder={`特集の紹介文や説明を入力してください。\n\n## 見出し　← 見出しを作れます\n本文テキスト\n\n![](画像URL)　← 「画像を挿入」ボタンで自動挿入されます`}
                        rows={16}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-900 resize-y font-mono"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                        「## 見出し」で見出し　／　「画像を挿入」ボタンで本文中に画像を配置できます
                    </p>
                </div>

                {/* おすすめ商品（編集時のみ） */}
                {isEdit && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">
                            <i className="ri-star-line mr-1 text-yellow-500"></i>
                            おすすめ商品
                            <span className="ml-2 text-xs text-gray-400 font-normal">この特集ページの下部に表示されます</span>
                        </h2>

                        {/* 追加フォーム */}
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={recUrlInput}
                                onChange={e => { setRecUrlInput(e.target.value); setRecError(null); }}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleRecAdd())}
                                placeholder="商品URLまたは商品IDを貼り付け"
                                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                            />
                            <button
                                type="button"
                                onClick={handleRecAdd}
                                disabled={recAdding || !recUrlInput.trim()}
                                className="px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {recAdding ? '追加中...' : '追加'}
                            </button>
                        </div>
                        {recError && <p className="text-red-500 text-xs mb-3">{recError}</p>}

                        {/* リスト */}
                        {recItems.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">まだ登録されていません</p>
                        ) : (
                            <div className="space-y-2">
                                {recItems.map((item, index) => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                                        <div className="w-12 h-12 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                                            {item.product?.images?.[0] ? (
                                                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <i className="ri-image-line"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name ?? '（不明）'}</p>
                                            <p className="text-xs text-gray-500">¥{(item.product?.price ?? 0).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-0.5 flex-shrink-0">
                                            <button type="button" onClick={() => moveRecOrder(index, 'up')} disabled={index === 0}
                                                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                                                <i className="ri-arrow-up-s-line"></i>
                                            </button>
                                            <button type="button" onClick={() => moveRecOrder(index, 'down')} disabled={index === recItems.length - 1}
                                                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                                                <i className="ri-arrow-down-s-line"></i>
                                            </button>
                                            <button type="button" onClick={() => handleRecDelete(item.id)}
                                                className="ml-1 p-1 text-red-400 hover:text-red-600">
                                                <i className="ri-delete-bin-line"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Publish */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={isActive}
                            onChange={e => setIsActive(e.target.checked)}
                            className="w-4 h-4 accent-gray-900"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                            公開する（特集ページ・トップページに表示）
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pb-8">
                    <Link
                        to="/admin/collections"
                        className="flex-1 text-center px-4 py-3 border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        キャンセル
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-4 py-3 bg-gray-900 text-white text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                        {saving ? (uploadingImage ? 'アップロード中...' : '保存中...') : '保存'}
                    </button>
                </div>
            </form>
        </div>
    );
}

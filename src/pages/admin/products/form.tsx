import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

export default function AdminProductFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState(searchParams.get('description') || '');
    const [price, setPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    const [condition, setCondition] = useState('');
    const [stock, setStock] = useState('1');
    const [status, setStatus] = useState('published');
    // 複数画像管理
    const [existingImages, setExistingImages] = useState<string[]>([]); // 保存済みURL
    const [newImageFiles, setNewImageFiles] = useState<{ file: File; preview: string }[]>([]); // 追加予定
    const [uploadingImage, setUploadingImage] = useState(false);
    const [sellerInstagram, setSellerInstagram] = useState(searchParams.get('seller_instagram') || '');
    const fromBuyback = searchParams.get('from_buyback');

    useEffect(() => {
        if (isEdit) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching product:', error);
            alert('商品の取得に失敗しました。');
            navigate('/admin/products');
        } else if (data) {
            setName(data.name || '');
            setDescription(data.description || '');
            setPrice(data.price?.toString() || '');
            setOriginalPrice(data.original_price?.toString() || '');
            setCategory(data.category || '');
            setSize(data.size || '');
            setColor(data.color || '');
            setCondition(data.condition || '');
            setStock(data.stock?.toString() || '0');
            setStatus(data.status || 'draft');
            setExistingImages(data.images || []);
            setSellerInstagram(data.seller_instagram || '');
        }
        setLoading(false);
    };

    const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const entries = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
        setNewImageFiles((prev) => [...prev, ...entries]);
        e.target.value = ''; // 同じファイルの再選択を可能にする
    };

    const removeExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImageFiles((prev) => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    // Canvas で画像を圧縮して 5MB 以下にする
    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const MAX_BYTES = 5 * 1024 * 1024; // 5MB
            const MAX_SIZE = 1920; // 長辺の最大px

            // HEIC/HEIF は Canvas で変換できないため早期エラー
            const lowerType = file.type.toLowerCase();
            const lowerName = file.name.toLowerCase();
            if (
                lowerType === 'image/heic' ||
                lowerType === 'image/heif' ||
                lowerName.endsWith('.heic') ||
                lowerName.endsWith('.heif')
            ) {
                reject(new Error('HEIC/HEIF形式の画像はアップロードできません。\niPhoneの設定で「フォーマット → 互換性優先」に変更するか、JPEG・PNG形式に変換してからお試しください。'));
                return;
            }

            // 5MB 未満の JPEG はそのまま返す
            if (file.size <= MAX_BYTES && file.type === 'image/jpeg') {
                resolve(file);
                return;
            }

            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            // 読み込み失敗時はエラーを返す
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error(`画像の読み込みに失敗しました（${file.name}）。\nJPEG・PNG・WebP形式の画像をお試しください。`));
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
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error } = await supabase.storage
            .from('product-images')
            .upload(fileName, compressed, { upsert: true, contentType: 'image/jpeg' });
        if (error) throw new Error(`ストレージへのアップロードに失敗しました: ${error.message}`);
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        let uploadedUrls: string[] = [];
        if (newImageFiles.length > 0) {
            setUploadingImage(true);
            try {
                uploadedUrls = await Promise.all(newImageFiles.map((f) => uploadImage(f.file)));
            } catch (err) {
                console.error('Image upload failed:', err);
                const msg = err instanceof Error ? err.message : '画像のアップロードに失敗しました。';
                alert(msg);
                setSaving(false);
                setUploadingImage(false);
                return;
            }
            setUploadingImage(false);
        }

        const finalImages = [...existingImages, ...uploadedUrls];

        const productData = {
            name,
            description,
            price: parseInt(price, 10) || 0,
            original_price: originalPrice ? parseInt(originalPrice, 10) : null,
            category,
            size,
            color,
            condition,
            stock: parseInt(stock, 10) || 0,
            status,
            images: finalImages,
            seller_instagram: sellerInstagram.replace('@', '') || null,
        };

        if (isEdit) {
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', id);

            if (error) {
                console.error('Error updating product:', error);
                alert('商品の更新に失敗しました。\nエラー: ' + error.message);
            } else {
                alert('商品を更新しました。');
                navigate('/admin/products');
            }
        } else {
            const { error } = await supabase
                .from('products')
                .insert([productData]);

            if (error) {
                console.error('Error creating product:', error);
                alert('商品の登録に失敗しました。');
            } else {
                alert('商品を登録しました。');
                navigate('/admin/products');
            }
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">読み込み中...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/products')}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <i className="ri-arrow-left-line text-xl"></i>
                </button>
                <h1 className="text-2xl font-bold">
                    {isEdit ? '商品を編集' : '新規商品登録'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">商品名 *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="商品名を入力"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">商品説明</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-32"
                            placeholder="商品の説明を入力"
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">販売価格 (税込) *</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">定価・参考価格 (任意)</label>
                        <input
                            type="number"
                            min="0"
                            value={originalPrice}
                            onChange={(e) => setOriginalPrice(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">カテゴリー</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                        >
                            <option value="">選択してください</option>
                            <option value="アウター">アウター</option>
                            <option value="トップス">トップス</option>
                            <option value="ボトムス">ボトムス</option>
                            <option value="アクセサリー">アクセサリー</option>
                            <option value="その他">その他</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">サイズ</label>
                        <select
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                        >
                            <option value="">選択してください</option>
                            {['XS', 'SS', 'S', 'SM', 'M', 'ML', 'L', 'XL', 'XXL', 'フリーサイズ'].map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">カラー</label>
                        <input
                            type="text"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="例: レッド, ブルー"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">状態</label>
                        <select
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                        >
                            <option value="">選択してください</option>
                            <option value="S">S (新品・未使用)</option>
                            <option value="A">A (非常に良い)</option>
                            <option value="B">B (良い)</option>
                            <option value="C">C (可)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">在庫数 *</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">ステータス *</label>
                        <select
                            required
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                        >
                            <option value="published">公開</option>
                            <option value="draft">非公開 (下書き)</option>
                        </select>
                    </div>



                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                            <i className="ri-instagram-line text-pink-500"></i>
                            売主のInstagramアカウント
                            <span className="text-gray-400 font-normal text-xs">任意・商品ページに表示</span>
                        </label>
                        {fromBuyback && (
                            <p className="text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 w-fit">
                                <i className="ri-links-line"></i>
                                買取申込から自動入力されました
                            </p>
                        )}
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
                            <input
                                type="text"
                                value={sellerInstagram}
                                onChange={(e) => setSellerInstagram(e.target.value.replace('@', ''))}
                                className="w-full pl-8 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all"
                                placeholder="instagram_username"
                            />
                        </div>
                        {sellerInstagram && (
                            <a
                                href={`https://www.instagram.com/${sellerInstagram.trim().replace(/^@/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-pink-600 hover:underline flex items-center gap-1"
                            >
                                <i className="ri-external-link-line"></i>
                                @{sellerInstagram} のプロフィールを確認
                            </a>
                        )}
                    </div>

                    <div className="space-y-3 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                            商品画像
                            <span className="text-gray-400 font-normal ml-1">（複数枚可・1枚目がメイン画像）</span>
                        </label>

                        {/* サムネイル一覧 */}
                        {(existingImages.length > 0 || newImageFiles.length > 0) && (
                            <div className="flex flex-wrap gap-3">
                                {existingImages.map((url, i) => (
                                    <div key={`existing-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                                        <img src={url} alt={`画像${i + 1}`} className="w-full h-full object-cover" />
                                        {i === 0 && (
                                            <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">メイン</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(i)}
                                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-100 transition-opacity"
                                        >
                                            <i className="ri-close-line text-xs"></i>
                                        </button>
                                    </div>
                                ))}
                                {newImageFiles.map((f, i) => (
                                    <div key={`new-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-300 group">
                                        <img src={f.preview} alt={`新規${i + 1}`} className="w-full h-full object-cover" />
                                        <span className="absolute top-1 left-1 bg-blue-500/80 text-white text-[10px] px-1 rounded">新規</span>
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(i)}
                                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-100 transition-opacity"
                                        >
                                            <i className="ri-close-line text-xs"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 追加ボタン */}
                        <label className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                            <i className="ri-add-line text-2xl text-gray-400"></i>
                            <span className="text-sm text-gray-500">画像を追加</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleAddImages}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="px-6 py-3 rounded-lg font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                        disabled={saving}
                    >
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                        disabled={saving}
                    >
                        {uploadingImage ? '画像アップロード中...' : saving ? '保存中...' : '保存する'}
                    </button>
                </div>
            </form>
        </div>
    );
}

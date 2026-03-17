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
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
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
            const existingUrl = data.images?.[0] || '';
            setImageUrl(existingUrl);
            setImagePreview(existingUrl);
            setSellerInstagram(data.seller_instagram || '');
        }
        setLoading(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const uploadImage = async (file: File): Promise<string> => {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}.${ext}`;
        const { error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        let finalImageUrl = imageUrl;
        if (imageFile) {
            setUploadingImage(true);
            try {
                finalImageUrl = await uploadImage(imageFile);
            } catch (err) {
                console.error('Image upload failed:', err);
                alert('画像のアップロードに失敗しました。');
                setSaving(false);
                setUploadingImage(false);
                return;
            }
            setUploadingImage(false);
        }

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
            images: finalImageUrl ? [finalImageUrl] : [],
            seller_instagram: sellerInstagram.replace('@', '') || null,
        };

        if (isEdit) {
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', id);

            if (error) {
                console.error('Error updating product:', error);
                alert('商品の更新に失敗しました。');
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
                        <input
                            type="text"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="例: S, M, L"
                        />
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
                        <label className="block text-sm font-medium text-gray-700">
                          売主のInstagramアカウント
                          <span className="text-gray-400 font-normal ml-1">（任意・商品ページに表示されます）</span>
                        </label>
                        {fromBuyback && (
                          <p className="text-xs text-orange-600 flex items-center gap-1">
                            <i className="ri-link"></i>
                            買取申込から自動入力されました
                          </p>
                        )}
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                          <input
                            type="text"
                            value={sellerInstagram}
                            onChange={(e) => setSellerInstagram(e.target.value)}
                            className="w-full pl-7 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="instagram_id"
                          />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">商品画像</label>
                        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                            <div className="flex flex-col items-center text-gray-400">
                                <i className="ri-upload-cloud-2-line text-3xl mb-1"></i>
                                <span className="text-sm">クリックして画像を選択</span>
                                <span className="text-xs mt-1">JPG, PNG, WebP</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                        {imagePreview && (
                            <div className="mt-3 flex items-center gap-4">
                                <div className="w-32 h-32 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                                    <img src={imagePreview} alt="プレビュー" className="w-full h-full object-cover" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setImageFile(null); setImagePreview(''); setImageUrl(''); }}
                                    className="text-sm text-red-500 hover:text-red-700"
                                >
                                    画像を削除
                                </button>
                            </div>
                        )}
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

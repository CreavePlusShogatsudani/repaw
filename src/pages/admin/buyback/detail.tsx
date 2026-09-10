import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { REQUEST_STATUS_ADMIN, RANK_OPTIONS, ITEM_TYPE_OPTIONS, ITEM_STATUS_USER, itemDisplayName, requestTotal, type BuybackItem } from '../../../lib/buyback';

interface BuybackRequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  item_type: string | null;
  item_description: string | null;
  condition: string | null;
  purchase_date: string | null;
  message: string | null;
  instagram: string | null;
  status: string;
  admin_note: string | null;
  return_preference: 'donate' | 'return_cod';
  payout_method: 'donate' | 'transfer' | null;
  bank_name: string | null;
  bank_branch: string | null;
  bank_account_type: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  user_responded_at: string | null;
  received_at: string | null;
  paid_at: string | null;
  created_at: string;
}

interface ItemInternal {
  condition_notes: string;
  sale_price: string;
}

type ItemDraft = Omit<BuybackItem, 'buyback_price' | 'back_length_cm' | 'chest_cm' | 'neck_cm'> & {
  buyback_price: string;
  back_length_cm: string;
  chest_cm: string;
  neck_cm: string;
  internal: ItemInternal;
};

// スマホでも使える買取申込の詳細。到着した服を1点ずつ撮影・査定して、査定額を提示する
export default function AdminBuybackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<BuybackRequest | null>(null);
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const load = async () => {
    const [{ data: req, error }, { data: rows }, { data: internals }] = await Promise.all([
      supabase.from('buyback_requests').select('*').eq('id', id).single(),
      supabase.from('buyback_items').select('*').eq('request_id', id).order('sort_order', { ascending: true }),
      supabase.from('buyback_item_internal').select('*'),
    ]);
    if (error || !req) { alert('申込が見つかりません。'); navigate('/admin/buyback'); return; }
    const internalMap = new Map(((internals as any[]) || []).map((n) => [n.item_id, n]));
    setRequest(req as BuybackRequest);
    setAdminNote(req.admin_note || '');
    setItems(((rows as BuybackItem[]) || []).map((it) => toDraft(it, internalMap.get(it.id))));
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const toDraft = (it: BuybackItem, internal?: any): ItemDraft => ({
    ...it,
    buyback_price: it.buyback_price?.toString() ?? '',
    back_length_cm: it.back_length_cm?.toString() ?? '',
    chest_cm: it.chest_cm?.toString() ?? '',
    neck_cm: it.neck_cm?.toString() ?? '',
    internal: { condition_notes: internal?.condition_notes ?? '', sale_price: internal?.sale_price?.toString() ?? '' },
  });

  // ---- 申込のステータス操作
  const updateRequest = async (patch: Record<string, unknown>) => {
    const { error } = await supabase.from('buyback_requests').update(patch).eq('id', id);
    if (error) { alert('更新に失敗しました。'); return; }
    await load();
  };
  const markReceived = () => updateRequest({ status: 'received', received_at: new Date().toISOString() });
  const markCompleted = () => {
    if (!confirm(request?.payout_method === 'transfer' ? '振込済みとして完了にしますか？' : '寄付処理済みとして完了にしますか？')) return;
    return updateRequest({ status: 'completed', paid_at: new Date().toISOString() });
  };
  const saveNote = () => updateRequest({ admin_note: adminNote || null });

  const quote = async () => {
    if (items.length === 0) { alert('服が1点も登録されていません。'); return; }
    const undecided = items.filter((i) => !i.decision || (i.decision === 'buyable' && !i.buyback_price) || (i.decision === 'not_buyable' && !i.reject_reason));
    if (undecided.length > 0) { alert('可否・金額（または不可の理由）が未入力の服があります。'); return; }
    const allRejected = items.every((i) => i.decision === 'not_buyable');
    if (!confirm(allRejected ? '全点買取不可として確定しますか？' : `査定額 合計 ¥${requestTotal(items.map(numeric)).toLocaleString()} でユーザーに提示しますか？`)) return;
    const { error: itemError } = await supabase.from('buyback_items')
      .update({ status: 'appraised', updated_at: new Date().toISOString() })
      .eq('request_id', id).eq('decision', 'buyable');
    const { error: rejError } = await supabase.from('buyback_items')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('request_id', id).eq('decision', 'not_buyable');
    if (itemError || rejError) { alert('更新に失敗しました。'); return; }
    await updateRequest({ status: allRejected ? 'rejected' : 'quoted', estimated_price: requestTotal(items.map(numeric)) });
    // TODO(#21): 通知メール送信（査定結果が届きました）
  };

  // ---- 服1点の操作
  const numeric = (d: ItemDraft) => ({ decision: d.decision, buyback_price: d.buyback_price ? parseInt(d.buyback_price, 10) : null });

  const addItem = async () => {
    const { data, error } = await supabase.from('buyback_items')
      .insert({ request_id: id, sort_order: items.length })
      .select('*').single();
    if (error || !data) { alert('追加に失敗しました。'); return; }
    setItems((prev) => [...prev, toDraft(data as BuybackItem)]);
  };

  const setField = (itemId: string, patch: Partial<ItemDraft>) =>
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...patch } : it)));
  const setInternal = (itemId: string, patch: Partial<ItemInternal>) =>
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, internal: { ...it.internal, ...patch } } : it)));

  const saveItem = async (d: ItemDraft) => {
    setSavingId(d.id);
    const { error } = await supabase.from('buyback_items').update({
      has_tag: d.has_tag,
      brand: d.brand?.trim() || null,
      item_type: d.item_type || null,
      color: d.color?.trim() || null,
      size_label: d.size_label?.trim() || null,
      material: d.material?.trim() || null,
      back_length_cm: d.back_length_cm ? parseFloat(d.back_length_cm) : null,
      chest_cm: d.chest_cm ? parseFloat(d.chest_cm) : null,
      neck_cm: d.neck_cm ? parseFloat(d.neck_cm) : null,
      rank: d.rank || null,
      appraisal_comment: d.appraisal_comment?.trim() || null,
      decision: d.decision,
      reject_reason: d.decision === 'not_buyable' ? d.reject_reason?.trim() || null : null,
      buyback_price: d.decision === 'buyable' && d.buyback_price ? parseInt(d.buyback_price, 10) : null,
      updated_at: new Date().toISOString(),
    }).eq('id', d.id);
    const { error: internalError } = await supabase.from('buyback_item_internal').upsert({
      item_id: d.id,
      condition_notes: d.internal.condition_notes || null,
      sale_price: d.internal.sale_price ? parseInt(d.internal.sale_price, 10) : null,
      updated_at: new Date().toISOString(),
    });
    setSavingId(null);
    if (error || internalError) { alert('保存に失敗しました。'); return; }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('この服を削除しますか？')) return;
    const { error } = await supabase.from('buyback_items').delete().eq('id', itemId);
    if (error) { alert('削除に失敗しました。'); return; }
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // ---- 査定用写真（スマホのカメラから）。商品写真と同じ圧縮ルール
  const compressImage = (file: File): Promise<File> => new Promise((resolve, reject) => {
    const MAX_BYTES = 5 * 1024 * 1024;
    const MAX_SIZE = 1920;
    const lowerType = file.type.toLowerCase();
    const lowerName = file.name.toLowerCase();
    if (lowerType === 'image/heic' || lowerType === 'image/heif' || lowerName.endsWith('.heic') || lowerName.endsWith('.heif')) {
      reject(new Error('HEIC/HEIF形式の画像はアップロードできません。iPhone は設定 > カメラ > フォーマット を「互換性優先」にしてください。'));
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
        width = Math.round(width * ratio); height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      const tryCompress = (quality: number) => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          if (blob.size <= MAX_BYTES || quality <= 0.1) resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
          else tryCompress(Math.max(quality - 0.1, 0.1));
        }, 'image/jpeg', quality);
      };
      tryCompress(0.85);
    };
    img.src = objectUrl;
  });

  const addPhotos = async (d: ItemDraft, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingId(d.id);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file);
        const path = `buyback/${id}/${d.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error } = await supabase.storage.from('product-images').upload(path, compressed, { upsert: true, contentType: 'image/jpeg' });
        if (error) throw error;
        urls.push(supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl);
      }
      const next = [...(d.intake_photos || []), ...urls];
      const { error } = await supabase.from('buyback_items').update({ intake_photos: next, updated_at: new Date().toISOString() }).eq('id', d.id);
      if (error) throw error;
      setField(d.id, { intake_photos: next });
    } catch (e) {
      alert((e as Error).message || 'アップロードに失敗しました。');
    } finally {
      setUploadingId(null);
    }
  };

  const readWithAi = async (d: ItemDraft) => {
    if (d.intake_photos.length === 0) { alert('先に写真を撮影・追加してください。'); return; }
    setReadingId(d.id);
    try {
      const { data, error } = await supabase.functions.invoke('appraise-item', { body: { item_id: d.id } });
      if (error || !data || data.error) throw new Error(data?.error || error?.message || '読み取りに失敗しました');
      const r = data as { has_tag: boolean | null; brand: string | null; item_type: string | null; color: string | null; size_label: string | null; material: string | null; condition_notes: string[]; notes: string | null };
      const notes = [...r.condition_notes, ...(r.notes ? [r.notes] : [])].join('\n');
      setItems((prev) => prev.map((it) => it.id !== d.id ? it : {
        ...it,
        has_tag: it.has_tag ?? r.has_tag,
        brand: it.brand?.trim() ? it.brand : r.brand,
        item_type: it.item_type || r.item_type,
        color: it.color?.trim() ? it.color : r.color,
        size_label: it.size_label?.trim() ? it.size_label : r.size_label,
        material: it.material?.trim() ? it.material : r.material,
        internal: { ...it.internal, condition_notes: it.internal.condition_notes ? `${it.internal.condition_notes}\n${notes}` : notes },
      }));
    } catch (e) {
      alert((e as Error).message || '読み取りに失敗しました。');
    } finally {
      setReadingId(null);
    }
  };

  const removePhoto = async (d: ItemDraft, url: string) => {
    const next = d.intake_photos.filter((u) => u !== url);
    const { error } = await supabase.from('buyback_items').update({ intake_photos: next }).eq('id', d.id);
    if (error) { alert('削除に失敗しました。'); return; }
    setField(d.id, { intake_photos: next });
  };

  if (loading || !request) return <div className="text-center py-16 text-gray-500">読み込み中...</div>;

  const st = REQUEST_STATUS_ADMIN[request.status] ?? { label: request.status, color: 'bg-gray-100 text-gray-800' };
  const editable = ['pending', 'received', 'reviewing'].includes(request.status);
  const total = requestTotal(items.map(numeric));
  const inputCls = 'w-full p-2.5 border border-gray-200 rounded text-sm bg-white';

  return (
    <div className="max-w-5xl">
      <Link to="/admin/buyback" className="text-sm text-gray-500 hover:text-gray-900"><i className="ri-arrow-left-line mr-1"></i>買取申込一覧</Link>

      {/* 申込の概要とステータス操作 */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{request.name}</h1>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {request.status === 'pending' && <button onClick={markReceived} className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700">商品が届いた</button>}
          {editable && <button onClick={quote} className="px-4 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600">査定額を提示する（¥{total.toLocaleString()}）</button>}
          {request.status === 'accepted' && <button onClick={markCompleted} className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700">{request.payout_method === 'transfer' ? '振込済みにする' : '寄付処理済みにする'}</button>}
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
        <div className="bg-white rounded-lg shadow-sm p-5 space-y-1.5">
          <p className="font-bold mb-2">申込者</p>
          <p><span className="text-gray-500">メール:</span> <a href={`mailto:${request.email}`} className="text-blue-600 hover:underline">{request.email}</a></p>
          <p><span className="text-gray-500">電話:</span> {request.phone || '-'}</p>
          <p><span className="text-gray-500">住所:</span> {request.address || '-'}</p>
          {request.instagram && <p><span className="text-gray-500">Instagram:</span> @{request.instagram.replace('@', '')}</p>}
          <p><span className="text-gray-500">申込日:</span> {new Date(request.created_at).toLocaleString('ja-JP')}</p>
          <p><span className="text-gray-500">買取不可の扱い:</span> {request.return_preference === 'return_cod' ? '着払いで返送' : '寄付に回す'}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 space-y-1.5">
          <p className="font-bold mb-2">申込内容（ユーザー入力）</p>
          <p><span className="text-gray-500">種類:</span> {request.item_type || '-'}</p>
          <p><span className="text-gray-500">説明:</span> {request.item_description || '-'}</p>
          <p><span className="text-gray-500">状態:</span> {request.condition || '-'}</p>
          <p><span className="text-gray-500">購入時期:</span> {request.purchase_date || '-'}</p>
          <p><span className="text-gray-500">ご要望:</span> {request.message || '-'}</p>
          <p className="text-xs text-gray-400 pt-2">
            到着: {request.received_at ? new Date(request.received_at).toLocaleDateString('ja-JP') : '-'} / 完了: {request.paid_at ? new Date(request.paid_at).toLocaleDateString('ja-JP') : '-'}
          </p>
        </div>
      </div>

      {/* ユーザーの回答 */}
      {request.payout_method && (
        <div className="mt-4 bg-white rounded-lg shadow-sm p-5 text-sm">
          <p className="font-bold mb-2">ユーザーの回答 <span className="text-xs text-gray-400 font-normal ml-2">{request.user_responded_at && new Date(request.user_responded_at).toLocaleString('ja-JP')}</span></p>
          <p>受け取り方法: <span className="font-medium">{request.payout_method === 'donate' ? '全額寄付' : '口座振込'}</span></p>
          {request.payout_method === 'transfer' && (
            <div className="mt-2 bg-blue-50 rounded p-3 space-y-1">
              <p>銀行: {request.bank_name} / 支店: {request.bank_branch}</p>
              <p>{request.bank_account_type} {request.bank_account_number} / 名義: {request.bank_account_holder}</p>
            </div>
          )}
        </div>
      )}
      {request.status === 'returned' && <div className="mt-4 bg-gray-100 rounded-lg p-4 text-sm">ユーザーは査定額に同意せず、全点の着払い返送を選びました。</div>}

      {/* 服1点ごとの査定 */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold">届いた服（{items.length}点）</h2>
        {editable && <button onClick={addItem} className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700"><i className="ri-add-line mr-1"></i>服を追加</button>}
      </div>
      <p className="text-xs text-gray-500 mt-1">到着したら1点ずつ「服を追加」し、タグ・全体・気になる箇所をスマホで撮影します。「AIで読み取る」でブランド・種類・色・サイズ・素材・状態の所見が空欄に入るので、確認して可否とランクと金額を入れます。写真は本人にも見えます。</p>

      <div className="mt-4 space-y-4">
        {items.map((d, index) => (
          <div key={d.id} className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold">{index + 1}. {itemDisplayName(d)} <span className="ml-2 text-xs font-normal text-gray-400">{ITEM_STATUS_USER[d.status]}{d.product_id && ' · 下書き商品あり'}</span></p>
              <div className="flex gap-2">
                {d.product_id && <Link to={`/admin/products/${d.product_id}/edit`} className="px-3 py-1 border text-xs rounded hover:bg-gray-50">商品を開く</Link>}
                {editable && <button onClick={() => deleteItem(d.id)} className="px-3 py-1 border text-xs rounded text-red-600 hover:bg-red-50">削除</button>}
              </div>
            </div>

            {/* 写真 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {d.intake_photos.map((url) => (
                <div key={url} className="relative w-24 h-28 bg-gray-100 overflow-hidden rounded">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {editable && <button onClick={() => removePhoto(d, url)} className="absolute top-1 right-1 w-6 h-6 bg-white/90 rounded-full text-xs" aria-label="写真を削除">×</button>}
                </div>
              ))}
              {editable && d.intake_photos.length > 0 && (
                <button
                  type="button"
                  onClick={() => readWithAi(d)}
                  disabled={readingId === d.id}
                  className="w-24 h-28 border border-gray-900 rounded flex flex-col items-center justify-center text-xs text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                  title="写真からブランド・種類・色・サイズ・素材・状態の所見を読み取って空欄を埋めます"
                >
                  <i className="ri-sparkling-line text-xl mb-1"></i>
                  {readingId === d.id ? '読み取り中' : 'AIで読み取る'}
                </button>
              )}
              {editable && (
                <label className="w-24 h-28 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-gray-50">
                  <i className="ri-camera-line text-xl mb-1"></i>
                  {uploadingId === d.id ? '送信中' : '撮影・追加'}
                  <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => addPhotos(d, e.target.files)} disabled={uploadingId === d.id} />
                </label>
              )}
            </div>

            <fieldset disabled={!editable} className="grid md:grid-cols-4 gap-3 text-sm disabled:opacity-70">
              <label className="space-y-1"><span className="text-xs text-gray-500">タグ</span>
                <select value={d.has_tag === null ? '' : d.has_tag ? 'yes' : 'no'} onChange={(e) => setField(d.id, { has_tag: e.target.value === '' ? null : e.target.value === 'yes' })} className={inputCls}>
                  <option value="">未確認</option><option value="yes">あり</option><option value="no">なし</option>
                </select>
              </label>
              <label className="space-y-1"><span className="text-xs text-gray-500">ブランド（無ければ空）</span><input value={d.brand ?? ''} onChange={(e) => setField(d.id, { brand: e.target.value })} className={inputCls} placeholder="ノーブランドは空欄" /></label>
              <label className="space-y-1"><span className="text-xs text-gray-500">種類</span>
                <select value={d.item_type ?? ''} onChange={(e) => setField(d.id, { item_type: e.target.value })} className={inputCls}>
                  <option value="">選択</option>{ITEM_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="space-y-1"><span className="text-xs text-gray-500">色</span><input value={d.color ?? ''} onChange={(e) => setField(d.id, { color: e.target.value })} className={inputCls} placeholder="グレー" /></label>
              <label className="space-y-1"><span className="text-xs text-gray-500">サイズ表記</span><input value={d.size_label ?? ''} onChange={(e) => setField(d.id, { size_label: e.target.value })} className={inputCls} placeholder="S / M / フリー" /></label>
              <label className="space-y-1"><span className="text-xs text-gray-500">素材</span><input value={d.material ?? ''} onChange={(e) => setField(d.id, { material: e.target.value })} className={inputCls} placeholder="綿100%" /></label>
              <label className="space-y-1"><span className="text-xs text-gray-500">背丈 cm</span><input type="number" step="0.5" value={d.back_length_cm} onChange={(e) => setField(d.id, { back_length_cm: e.target.value })} className={inputCls} /></label>
              <label className="space-y-1"><span className="text-xs text-gray-500">胴回り cm / 首回り cm</span>
                <div className="flex gap-2">
                  <input type="number" step="0.5" value={d.chest_cm} onChange={(e) => setField(d.id, { chest_cm: e.target.value })} className={inputCls} placeholder="胴" />
                  <input type="number" step="0.5" value={d.neck_cm} onChange={(e) => setField(d.id, { neck_cm: e.target.value })} className={inputCls} placeholder="首" />
                </div>
              </label>

              <label className="space-y-1 md:col-span-2"><span className="text-xs text-gray-500">状態の所見（社内メモ。本人には見えない）</span><textarea rows={2} value={d.internal.condition_notes} onChange={(e) => setInternal(d.id, { condition_notes: e.target.value })} className={inputCls} placeholder="袖口に軽い毛玉、内側に小さな汚れ" /></label>
              <label className="space-y-1 md:col-span-2"><span className="text-xs text-gray-500">本人に見せる一言</span><textarea rows={2} maxLength={120} value={d.appraisal_comment ?? ''} onChange={(e) => setField(d.id, { appraisal_comment: e.target.value })} className={inputCls} placeholder="袖口に軽い毛玉がありますが、全体はきれいな状態です" /></label>

              <label className="space-y-1"><span className="text-xs text-gray-500">可否</span>
                <select value={d.decision ?? ''} onChange={(e) => setField(d.id, { decision: (e.target.value || null) as ItemDraft['decision'] })} className={inputCls}>
                  <option value="">未定</option><option value="buyable">買取可</option><option value="not_buyable">買取不可</option>
                </select>
              </label>
              {d.decision === 'not_buyable' ? (
                <label className="space-y-1 md:col-span-3"><span className="text-xs text-gray-500">不可の理由（本人に見える）</span><input value={d.reject_reason ?? ''} onChange={(e) => setField(d.id, { reject_reason: e.target.value })} className={inputCls} placeholder="においが強いため" /></label>
              ) : (
                <>
                  <label className="space-y-1"><span className="text-xs text-gray-500">ランク</span>
                    <select value={d.rank ?? ''} onChange={(e) => setField(d.id, { rank: e.target.value || null })} className={inputCls}>
                      <option value="">選択</option>{RANK_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1"><span className="text-xs text-gray-500">買取額（円）</span><input type="number" min="0" value={d.buyback_price} onChange={(e) => setField(d.id, { buyback_price: e.target.value })} className={inputCls} placeholder="500" /></label>
                  <label className="space-y-1"><span className="text-xs text-gray-500">販売予定価格（社内）</span><input type="number" min="0" value={d.internal.sale_price} onChange={(e) => setInternal(d.id, { sale_price: e.target.value })} className={inputCls} placeholder="2500" /></label>
                </>
              )}
            </fieldset>

            {editable && (
              <div className="mt-4 flex justify-end">
                <button onClick={() => saveItem(d)} disabled={savingId === d.id} className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700 disabled:bg-gray-400">{savingId === d.id ? '保存中...' : 'この服を保存'}</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 管理者メモ */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-5">
        <label className="block text-sm font-bold mb-2">管理者メモ（社内用）</label>
        <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded text-sm" />
        <div className="mt-2 flex justify-end"><button onClick={saveNote} className="px-4 py-2 border text-sm rounded hover:bg-gray-50">メモを保存</button></div>
      </div>
    </div>
  );
}

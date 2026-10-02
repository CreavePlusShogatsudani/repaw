// 買取フローの共通定義（ステータス・表示名）。公開側と管理画面で共有する

export interface BuybackItem {
  id: string;
  request_id: string;
  sort_order: number;
  intake_photos: string[];
  has_tag: boolean | null;
  brand: string | null;
  item_type: string | null;
  color: string | null;
  size_label: string | null;
  material: string | null;
  back_length_cm: number | null;
  chest_cm: number | null;
  neck_cm: number | null;
  rank: string | null;
  appraisal_comment: string | null;
  decision: 'buyable' | 'not_buyable' | null;
  reject_reason: string | null;
  buyback_price: number | null;
  product_id: string | null;
  status: 'pending' | 'appraised' | 'accepted' | 'awaiting_photo' | 'photographed' | 'listed' | 'sold' | 'rejected' | 'returned';
}

// 公開側（マイページ・回答画面）で取る列。社内メモは buyback_item_internal に分離してある
export const BUYBACK_ITEM_PUBLIC_SELECT =
  'id, request_id, sort_order, intake_photos, has_tag, brand, item_type, color, size_label, material, back_length_cm, chest_cm, neck_cm, rank, appraisal_comment, decision, reject_reason, buyback_price, product_id, status';

// 申込のステータス（ユーザー向けの言葉）
export const REQUEST_STATUS_USER: Record<string, string> = {
  pending:   '受付済み（発送をお待ちしています）',
  received:  '商品到着・査定中',
  reviewing: '査定中',
  quoted:    '査定額が届いています',
  accepted:  '回答済み',
  completed: '完了',
  returned:  '返送',
  rejected:  '買取不可',
};

// 申込のステータス（管理画面向け）
export const REQUEST_STATUS_ADMIN: Record<string, { label: string; color: string }> = {
  pending:   { label: '申込（到着待ち）', color: 'bg-yellow-100 text-yellow-800' },
  received:  { label: '到着・査定中',  color: 'bg-purple-100 text-purple-800' },
  reviewing: { label: '査定中',       color: 'bg-purple-100 text-purple-800' },
  quoted:    { label: '査定額提示済み', color: 'bg-orange-100 text-orange-800' },
  accepted:  { label: 'ユーザー回答済み', color: 'bg-green-100 text-green-800' },
  completed: { label: '完了',         color: 'bg-gray-200 text-gray-800' },
  returned:  { label: '返送',         color: 'bg-gray-100 text-gray-600' },
  rejected:  { label: '全点買取不可',  color: 'bg-red-100 text-red-800' },
};

// 管理者が次に動く必要がある申込: 到着待ち・査定・支払い処理と、まだ返送していない全点返送・全点不可（返送希望）。
// 一部の買取不可の返送は「振込済み / 寄付処理済み」と一緒に記録する（accepted の間は要対応に入っている）
type ActionFields = { status: string; returned_at: string | null; return_preference: string };
export const needsAction = (r: ActionFields) =>
  ['pending', 'received', 'accepted'].includes(r.status) || needsReturn(r);
export const needsReturn = (r: ActionFields) =>
  !r.returned_at && (r.status === 'returned' || (r.status === 'rejected' && r.return_preference === 'return_cod'));
// needsAction と同じ条件の PostgREST フィルタ（件数バッジ・ダッシュボード用）
export const NEEDS_ACTION_FILTER =
  'status.in.(pending,received,accepted),and(returned_at.is.null,or(status.eq.returned,and(status.eq.rejected,return_preference.eq.return_cod)))';

// 服1点のステータス（ユーザー向け）
export const ITEM_STATUS_USER: Record<string, string> = {
  pending:        '査定中',
  appraised:      '査定済み',
  accepted:       '買取確定',
  awaiting_photo: '買取確定',
  photographed:   '出品準備中',
  listed:         '販売中',
  sold:           '売れました',
  rejected:       '買取不可',
  returned:       '返送',
};

// 買取の送り先。ユーザーが自分で梱包して着払いで送る（配送キットは送らない。2026-09-10 決定）
// TODO: 実際の宛名・住所・電話番号に差し替える
export const BUYBACK_SHIP_TO = {
  name: 'RePaw 買取係',
  postal: '〒000-0000',
  address: '（送り先住所を設定してください）',
  tel: '000-0000-0000',
};

export const ITEM_TYPE_OPTIONS = ['パーカー', 'トレーナー', 'Tシャツ', 'タンクトップ', 'ニット', 'ワンピース', 'アウター', 'レインコート', 'ハーネス', 'その他'];

// 「グレーのパーカー」「ブランド パーカー」のような表示名
export const itemDisplayName = (item: Pick<BuybackItem, 'brand' | 'color' | 'item_type'>) => {
  const parts = [item.brand?.trim(), item.color?.trim(), item.item_type?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : '査定中の服';
};

// 申込の合計（買取可の服の合計額）
export const requestTotal = (items: Pick<BuybackItem, 'decision' | 'buyback_price'>[]) =>
  items.filter((i) => i.decision === 'buyable').reduce((sum, i) => sum + (i.buyback_price ?? 0), 0);

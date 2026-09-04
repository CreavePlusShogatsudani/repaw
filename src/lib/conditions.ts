// 状態ランクの唯一の定義。FAQ の説明文と揃えてある（A/B/C の3段階）。
// 一覧のフィルタ・商品詳細の凡例・カードの表示はすべてここを参照する。
export const CONDITION_RANKS = ['A', 'B', 'C'] as const;
export type ConditionRank = (typeof CONDITION_RANKS)[number];

export const CONDITION_INFO: Record<ConditionRank, { label: string; short: string; description: string }> = {
  A: {
    label: 'Aランク',
    short: '新品同様',
    description: 'タグ付き未使用、または使用感がほとんどないもの。',
  },
  B: {
    label: 'Bランク',
    short: '使用感の少ない美品',
    description: '数回の着用程度。目立つ汚れ・毛玉・ほつれはありません。',
  },
  C: {
    label: 'Cランク',
    short: '使用感あり・良品',
    description: '小さな汚れや毛玉など使用感はありますが、着用に支障はありません。気になる点は商品写真と説明に記載しています。',
  },
};

export const getConditionInfo = (rank: string | null | undefined) =>
  rank && rank in CONDITION_INFO ? CONDITION_INFO[rank as ConditionRank] : null;

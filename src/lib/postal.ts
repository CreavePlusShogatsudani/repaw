// 郵便番号から都道府県・市区町村を引く（zipcloud API。無料・キー不要・ブラウザから直接呼べる）
// マイページのプロフィールとチェックアウトの住所入力で共有する
export interface PostalAddress {
  prefecture: string;
  city: string; // 市区町村 + 町域
}

export const normalizePostalCode = (raw: string) => raw.replace(/\D/g, '');

export async function lookupPostalCode(raw: string): Promise<PostalAddress | null> {
  const zip = normalizePostalCode(raw);
  if (zip.length !== 7) return null;
  const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`);
  const data = await res.json();
  const r = data?.results?.[0];
  if (!r) return null;
  return { prefecture: r.address1, city: `${r.address2}${r.address3}` };
}

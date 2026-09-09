// 公開側で商品を取るときの select。前のオーナー（previous_owners）を一緒に取る
export const PRODUCT_SELECT = '*, previous_owner:previous_owners(id, dog_name, dog_photo_url, instagram, story)';

export const instagramHandle = (value: string | null | undefined) => value?.trim().replace(/^@/, '') || '';
export const instagramUrl = (value: string | null | undefined) => `https://www.instagram.com/${instagramHandle(value)}`;

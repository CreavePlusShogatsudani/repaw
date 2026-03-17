// microCMS 共通型
export interface MicroCMSBase {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
}

export interface MicroCMSListResponse<T> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}

export interface MicroCMSImage {
  url: string;
  width: number;
  height: number;
}

// 犬種
export interface Breed extends MicroCMSBase {
  name: string;
  slug?: string;
  icon?: MicroCMSImage;
}

// ブランド
export interface Brand extends MicroCMSBase {
  name: string;
  slug?: string;
  logo?: MicroCMSImage;
  description?: string;
}

// 出品者
export interface Seller extends MicroCMSBase {
  name?: string;
  nickname?: string;
  avatarUrl?: string;
  avatar?: MicroCMSImage;
  rating?: number;
  totalSales?: number;
  instagram?: string;
}

// 商品
export interface Product extends MicroCMSBase {
  name: string;
  price: number;
  originalPrice: number;
  images?: MicroCMSImage | MicroCMSImage[]; // 単一または複数
  image?: MicroCMSImage;
  description?: string;
  category: string | string[];
  size: string | string[];
  condition: string | string[];
  color?: string | string[];
  breed?: Breed;
  brand?: Brand;
  status: string | string[];
  seller?: Seller;
  buybackId?: string;
}

// ニュース
export interface News extends MicroCMSBase {
  title: string;
  category: string;
  thumbnail?: MicroCMSImage;
  excerpt: string;
  content: string;
  pubDate?: string; // publishedAtの代わり
}

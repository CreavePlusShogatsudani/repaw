import { createClient } from 'microcms-js-sdk';
import type {
  MicroCMSListResponse,
  Breed,
  Brand,
  Seller,
  Product,
  News,
} from '../types/microcms';

// microCMS クライアント
export const client = createClient({
  serviceDomain: import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.VITE_MICROCMS_API_KEY,
});

// 犬種一覧を取得
export const getBreeds = async () => {
  return await client.get<MicroCMSListResponse<Breed>>({
    endpoint: 'reeds',  // microCMSのエンドポイント名
  });
};

// ブランド一覧を取得
export const getBrands = async () => {
  return await client.get<MicroCMSListResponse<Brand>>({
    endpoint: 'brands',
  });
};

// 出品者一覧を取得
export const getSellers = async () => {
  return await client.get<MicroCMSListResponse<Seller>>({
    endpoint: 'sellers',
  });
};

// 商品一覧を取得
export const getProducts = async (queries?: {
  limit?: number;
  offset?: number;
  filters?: string;
  orders?: string;
}) => {
  return await client.get<MicroCMSListResponse<Product>>({
    endpoint: 'products',
    queries,
  });
};

// 商品詳細を取得
export const getProductById = async (id: string) => {
  return await client.get<Product>({
    endpoint: 'products',
    contentId: id,
  });
};

// ニュース一覧を取得
export const getNews = async (queries?: {
  limit?: number;
  offset?: number;
  filters?: string;
  orders?: string;
}) => {
  return await client.get<MicroCMSListResponse<News>>({
    endpoint: 'news',
    queries,
  });
};

// ニュース詳細を取得
export const getNewsById = async (id: string) => {
  return await client.get<News>({
    endpoint: 'news',
    contentId: id,
  });
};

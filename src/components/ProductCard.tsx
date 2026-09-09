import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { getConditionInfo } from '../lib/conditions';

export default function ProductCard({ product }: { product: Product }) {
  const [failedImage, setFailedImage] = useState(false);
  const condition = getConditionInfo(product.condition);
  const discounted = product.original_price != null && product.original_price > product.price;
  const status = product.status === 'sold_out' ? '売り切れ' : product.status === 'reserved' ? '購入手続き中' : null;
  const owner = product.previous_owner;
  return (
    <Link to={`/product/${product.id}`} className="product-card group" data-product-card>
      <div className="product-card-image">
        {product.images?.[0] && !failedImage ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" onError={() => setFailedImage(true)} className="h-full w-full object-contain transition-opacity group-hover:opacity-90" />
        ) : <span className="text-xs text-slate-500">写真準備中</span>}
        {status && <span className="product-status">{status}</span>}
      </div>
      {/* 前のオーナー: 登録がある場合だけ「○○ちゃんのおさがり」。写真の上には重ねず、下に置く */}
      {owner && (
        <p className="product-card-owner">
          {owner.dog_photo_url ? <img src={owner.dog_photo_url} alt="" loading="lazy" /> : <span className="avatar" aria-hidden="true"><i className="ri-emotion-happy-line text-sm"></i></span>}
          {owner.dog_name}ちゃんのおさがり
        </p>
      )}
      <h3 className="group-hover:underline underline-offset-4">{product.brand?.trim() ? `${product.brand} / ${product.name}` : product.name}</h3>
      {(product.size?.trim() || condition) && (
        <p className="product-card-meta">
          {product.size?.trim() && <span>サイズ {product.size}</span>}
          {condition && <span title={condition.description}>{condition.label}</span>}
        </p>
      )}
      {(product.back_length_cm || product.chest_cm) ? (
        <p className="product-card-meta">
          {[product.back_length_cm ? `背丈 ${product.back_length_cm}cm` : '', product.chest_cm ? `胴回り ${product.chest_cm}cm` : ''].filter(Boolean).join(' / ')}
        </p>
      ) : null}
      <p className="product-card-price">
        <span>¥{product.price.toLocaleString()}</span>
        {discounted && <del>¥{product.original_price!.toLocaleString()}</del>}
      </p>
    </Link>
  );
}

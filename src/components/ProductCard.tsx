import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { getConditionInfo } from '../lib/conditions';

export default function ProductCard({ product }: { product: Product }) {
  const [failedImage, setFailedImage] = useState(false);
  const condition = getConditionInfo(product.condition);
  const discounted = product.original_price != null && product.original_price > product.price;
  const status = product.status === 'sold_out' ? '売り切れ' : product.status === 'reserved' ? '購入手続き中' : null;
  return (
    <Link to={`/product/${product.id}`} className="product-card group" data-product-card>
      <div className="product-card-image">
        {product.images?.[0] && !failedImage ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" onError={() => setFailedImage(true)} className="h-full w-full object-contain transition-opacity group-hover:opacity-90" />
        ) : <span className="text-xs text-stone-500">写真準備中</span>}
        {status && <span className="product-status">{status}</span>}
      </div>
      <div className="pt-3">
        {product.brand?.trim() && <p className="mb-1 text-xs text-stone-500">{product.brand}</p>}
        <h3 className="text-sm font-medium leading-relaxed group-hover:underline underline-offset-4">{product.name}</h3>
        {(product.size?.trim() || condition) && (
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs leading-relaxed text-stone-600">
            {product.size?.trim() && <span>サイズ {product.size}</span>}
            {condition && <span title={condition.description}>{condition.label} · {condition.short}</span>}
          </p>
        )}
        {(product.back_length_cm || product.chest_cm) ? (
          <p className="mt-1 text-xs leading-relaxed text-stone-600">
            {[product.back_length_cm ? `背丈 ${product.back_length_cm}cm` : '', product.chest_cm ? `胴回り ${product.chest_cm}cm` : ''].filter(Boolean).join(' / ')}
          </p>
        ) : null}
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-base font-medium tabular-nums">
          <span>¥{product.price.toLocaleString()}</span>
          {discounted && <del className="text-xs font-normal text-stone-500">¥{product.original_price!.toLocaleString()}</del>}
        </p>
      </div>
    </Link>
  );
}

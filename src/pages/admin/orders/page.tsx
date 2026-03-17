import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Order, OrderItem } from '../../../types';

type OrderWithUser = Order & {
    profiles: { email: string } | null;
};

type OrderItemWithProduct = OrderItem & {
    products: { name: string; images: string[] } | null;
};

const STATUS_OPTIONS = [
    { value: 'pending',   label: '支払い待ち', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'paid',      label: '支払い済み', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped',   label: '発送済み',   color: 'bg-purple-100 text-purple-800' },
    { value: 'completed', label: '完了',       color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'キャンセル', color: 'bg-red-100 text-red-800' },
];

const getStatus = (status: string) =>
    STATUS_OPTIONS.find((s) => s.value === status) ?? { label: status, color: 'bg-gray-100 text-gray-800' };

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [expandedItems, setExpandedItems] = useState<Record<string, OrderItemWithProduct[]>>({});
    const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            alert('注文データの取得に失敗しました。');
            setLoading(false);
            return;
        }

        const orders = (data || []) as Order[];

        // user_id から profiles のメールを別途取得
        const userIds = [...new Set(orders.map((o) => o.user_id).filter(Boolean))] as string[];
        let emailMap: Record<string, string> = {};
        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, email')
                .in('id', userIds);
            if (profiles) {
                profiles.forEach((p: { id: string; email: string | null }) => {
                    if (p.email) emailMap[p.id] = p.email;
                });
            }
        }

        const merged: OrderWithUser[] = orders.map((o) => ({
            ...o,
            profiles: o.user_id && emailMap[o.user_id]
                ? { email: emailMap[o.user_id] }
                : null,
        }));

        setOrders(merged);
        setLoading(false);
    };

    useEffect(() => { fetchOrders(); }, []);

    const toggleExpand = async (orderId: string) => {
        if (expandedId === orderId) {
            setExpandedId(null);
            return;
        }
        setExpandedId(orderId);
        if (expandedItems[orderId]) return;

        setLoadingItems((prev) => ({ ...prev, [orderId]: true }));
        const { data, error } = await supabase
            .from('order_items')
            .select('*, products(name, images)')
            .eq('order_id', orderId);

        if (!error) {
            setExpandedItems((prev) => ({ ...prev, [orderId]: (data as unknown as OrderItemWithProduct[]) || [] }));
        }
        setLoadingItems((prev) => ({ ...prev, [orderId]: false }));
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert('ステータスの更新に失敗しました。');
        } else {
            setOrders(orders.map((o) =>
                o.id === id ? { ...o, status: newStatus as Order['status'] } : o
            ));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">注文管理</h1>
                <button
                    onClick={fetchOrders}
                    className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
                    title="更新"
                >
                    <i className="ri-refresh-line text-xl"></i>
                </button>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-500">読み込み中...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">注文がありません。</div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">注文日</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">注文ID</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">ユーザー</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">合計金額</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">ステータス</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((order) => (
                                <>
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                            {new Date(order.created_at).toLocaleDateString('ja-JP')}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                            {order.id.slice(0, 8)}...
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {order.profiles?.email || 'ゲスト'}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            ¥{order.total_amount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 appearance-none ${getStatus(order.status).color}`}
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s.value} value={s.value}>{s.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggleExpand(order.id)}
                                                className="px-3 py-1 border text-xs rounded hover:bg-gray-50"
                                            >
                                                {expandedId === order.id ? '閉じる' : '詳細'}
                                            </button>
                                        </td>
                                    </tr>

                                    {expandedId === order.id && (
                                        <tr key={`${order.id}-detail`} className="bg-gray-50">
                                            <td colSpan={6} className="px-6 py-5">
                                                {loadingItems[order.id] ? (
                                                    <div className="text-gray-400 text-sm">読み込み中...</div>
                                                ) : (
                                                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                                                        {/* 注文商品 */}
                                                        <div>
                                                            <p className="font-medium text-gray-700 mb-3">注文商品</p>
                                                            <div className="space-y-3">
                                                                {(expandedItems[order.id] || []).map((item) => (
                                                                    <div key={item.id} className="flex items-center gap-3">
                                                                        {item.products?.images?.[0] ? (
                                                                            <img
                                                                                src={item.products.images[0]}
                                                                                alt={item.products.name}
                                                                                className="w-12 h-12 object-cover rounded border border-gray-200 flex-shrink-0"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0" />
                                                                        )}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium truncate">
                                                                                {item.products?.name || '削除された商品'}
                                                                            </p>
                                                                            <p className="text-gray-500">
                                                                                ¥{item.price_at_purchase.toLocaleString()} × {item.quantity}
                                                                            </p>
                                                                        </div>
                                                                        <p className="font-medium whitespace-nowrap">
                                                                            ¥{(item.price_at_purchase * item.quantity).toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="mt-3 pt-3 border-t flex justify-between font-medium">
                                                                <span>合計</span>
                                                                <span>¥{order.total_amount.toLocaleString()}</span>
                                                            </div>
                                                        </div>

                                                        {/* 配送先 */}
                                                        <div>
                                                            <p className="font-medium text-gray-700 mb-3">配送先</p>
                                                            {order.shipping_address ? (
                                                                <div className="space-y-1 text-gray-600">
                                                                    <p>{order.shipping_address.name}</p>
                                                                    <p>〒{order.shipping_address.postal_code}</p>
                                                                    <p>
                                                                        {order.shipping_address.prefecture}
                                                                        {order.shipping_address.city}
                                                                        {order.shipping_address.address}
                                                                    </p>
                                                                    {order.shipping_address.building && (
                                                                        <p>{order.shipping_address.building}</p>
                                                                    )}
                                                                    {order.shipping_address.phone && (
                                                                        <p>{order.shipping_address.phone}</p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-gray-400">配送先情報なし</p>
                                                            )}

                                                            <div className="mt-4 pt-4 border-t space-y-1 text-gray-500">
                                                                <p><span className="text-gray-400">注文ID:</span> {order.id}</p>
                                                                {order.stripe_payment_intent_id && (
                                                                    <p className="font-mono text-xs"><span className="text-gray-400">Stripe:</span> {order.stripe_payment_intent_id}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

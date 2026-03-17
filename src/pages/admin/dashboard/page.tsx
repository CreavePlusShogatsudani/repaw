import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        productsCount: 0,
        ordersCount: 0,
        revenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            // Products count
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            // Orders count and revenue
            const { data: orders } = await supabase
                .from('orders')
                .select('total_amount, status');

            const revenue = orders?.reduce((sum, order) => {
                return order.status !== 'cancelled' ? sum + order.total_amount : sum;
            }, 0) || 0;

            setStats({
                productsCount: productsCount || 0,
                ordersCount: orders?.length || 0,
                revenue
            });
        };

        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8">ダッシュボード</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Products Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">登録商品数</h3>
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <i className="ri-shopping-bag-3-line text-xl"></i>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.productsCount}</div>
                    <p className="text-xs text-gray-500 mt-2">公開中の商品を含む全アイテム</p>
                </div>

                {/* Orders Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">総注文数</h3>
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                            <i className="ri-file-list-3-line text-xl"></i>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.ordersCount}</div>
                    <p className="text-xs text-gray-500 mt-2">全ての期間の注文</p>
                </div>

                {/* Revenue Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">総売上</h3>
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                            <i className="ri-money-jpy-circle-line text-xl"></i>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">¥{stats.revenue.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mt-2">キャンセルを除く売上合計</p>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="mt-8">
                <h2 className="text-lg font-bold mb-4">最近の注文</h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                    注文管理機能実装後に表示されます
                </div>
            </div>
        </div>
    );
}

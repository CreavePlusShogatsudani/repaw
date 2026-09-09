import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        productsCount: 0,
        ordersCount: 0,
        revenue: 0,
        photoQueue: 0,
        buybackAction: 0,
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

            // 買取: 撮影待ちの服と、管理者の対応待ちの申込
            const { count: photoQueue } = await supabase
                .from('buyback_items')
                .select('id', { count: 'exact', head: true })
                .eq('status', 'awaiting_photo');
            const { count: buybackAction } = await supabase
                .from('buyback_requests')
                .select('id', { count: 'exact', head: true })
                .in('status', ['pending', 'received', 'accepted']);

            setStats({
                productsCount: productsCount || 0,
                ordersCount: orders?.length || 0,
                revenue,
                photoQueue: photoQueue || 0,
                buybackAction: buybackAction || 0,
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

            {/* 買取の対応状況 */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/admin/photo-queue" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">撮影待ちの服</h3>
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700">
                            <i className="ri-camera-line text-xl"></i>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.photoQueue}<span className="text-base font-normal text-gray-500 ml-1">点</span></div>
                    <p className="text-xs text-gray-500 mt-2">買取が確定し、一眼レフの撮影と公開を待っている服</p>
                </Link>
                <Link to="/admin/buyback" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">対応が必要な買取申込</h3>
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700">
                            <i className="ri-price-tag-3-line text-xl"></i>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.buybackAction}<span className="text-base font-normal text-gray-500 ml-1">件</span></div>
                    <p className="text-xs text-gray-500 mt-2">キット送付・査定・振込や寄付処理が待っている申込</p>
                </Link>
            </div>
        </div>
    );
}

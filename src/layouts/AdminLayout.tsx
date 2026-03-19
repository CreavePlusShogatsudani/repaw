import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    navigate('/login');
                    return;
                }

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();

                if (error || !profile?.is_admin) {
                    console.error('Access denied: User is not an admin', error);
                    navigate('/');
                    return;
                }

                setIsAdmin(true);
            } catch (error) {
                console.error('Error checking admin status:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-500">Loading admin panel...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return null; // Will redirect in useEffect
    }

    const menuItems = [
        { path: '/admin', label: 'ダッシュボード', icon: 'ri-dashboard-line' },
        { path: '/admin/products', label: '商品管理', icon: 'ri-shopping-bag-3-line' },
        { path: '/admin/orders', label: '注文管理', icon: 'ri-file-list-3-line' },
        { path: '/admin/buyback', label: '買取申込管理', icon: 'ri-price-tag-3-line' },
        { path: '/admin/users', label: '管理者アカウント', icon: 'ri-shield-user-line' },
        { path: '/admin/banners', label: 'メインビジュアル', icon: 'ri-image-line' },
        { path: '/admin/collections', label: 'おすすめ商品グループ', icon: 'ri-folder-star-line' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:block">
                <div className="p-6">
                    <Link to="/" className="text-2xl font-playfair font-bold">RePaw Admin</Link>
                </div>
                <nav className="mt-6">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                                    ? 'bg-gray-800 text-white border-l-4 border-orange-500'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <i className={`${item.icon} mr-3 text-lg`}></i>
                            {item.label}
                        </Link>
                    ))}
                    <div className="mt-8 px-6">
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                navigate('/login');
                            }}
                            className="flex items-center text-sm font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        >
                            <i className="ri-logout-box-line mr-3 text-lg"></i>
                            ログアウト
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white shadow-sm md:hidden flex items-center justify-between p-4">
                    <span className="text-xl font-bold">RePaw Admin</span>
                    <button className="text-gray-600">
                        <i className="ri-menu-line text-2xl"></i>
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

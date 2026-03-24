import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// チャンクロード失敗時に1回だけリロードして再試行する（ループ防止付き）
function lazyWithRetry(factory: () => Promise<{ default: React.ComponentType<any> }>) {
  return lazy(() =>
    factory().catch((err) => {
      const reloadKey = 'chunk_reload_attempted';
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1');
        window.location.reload();
        return new Promise<never>(() => {});
      }
      // 既にリロード済みなら諦めてエラーを再スロー
      return Promise.reject(err);
    })
  );
}

const HomePage = lazyWithRetry(() => import('../pages/home/page'));
const ItemsPage = lazyWithRetry(() => import('../pages/items/page'));
const ItemDetailPage = lazyWithRetry(() => import('../pages/item-detail/page'));
const CartPage = lazyWithRetry(() => import('../pages/cart/page'));
const CheckoutPage = lazyWithRetry(() => import('../pages/checkout/page'));
const OrderCompletePage = lazyWithRetry(() => import('../pages/order-complete/page'));
const MyPage = lazyWithRetry(() => import('../pages/mypage/page'));
const LoginPage = lazyWithRetry(() => import('../pages/login/page'));
const SignupPage = lazyWithRetry(() => import('../pages/signup/page'));
const ForgotPasswordPage = lazyWithRetry(() => import('../pages/forgot-password/page'));
const ImpactPage = lazyWithRetry(() => import('../pages/impact/page'));
const SystemPage = lazyWithRetry(() => import('../pages/system/page'));
const BuybackPage = lazyWithRetry(() => import('../pages/buyback/page'));
const BuybackResponsePage = lazyWithRetry(() => import('../pages/buyback/response'));
const NewsPage = lazyWithRetry(() => import('../pages/news/page'));
const NewsDetailPage = lazyWithRetry(() => import('../pages/news-detail/page'));
const FeaturesPage = lazyWithRetry(() => import('../pages/features/page'));
const FeatureDetailPage = lazyWithRetry(() => import('../pages/feature-detail/page'));
const AboutPage = lazyWithRetry(() => import('../pages/about/page'));
const FAQPage = lazyWithRetry(() => import('../pages/faq/page'));
const NotFound = lazyWithRetry(() => import('../pages/NotFound'));

// Admin Pages
const AdminLayout = lazyWithRetry(() => import('../layouts/AdminLayout'));
const AdminDashboardPage = lazyWithRetry(() => import('../pages/admin/dashboard/page'));
const AdminProductsPage = lazyWithRetry(() => import('../pages/admin/products/page'));
const AdminProductFormPage = lazyWithRetry(() => import('../pages/admin/products/form'));
const AdminOrdersPage = lazyWithRetry(() => import('../pages/admin/orders/page'));
const AdminBuybackPage = lazyWithRetry(() => import('../pages/admin/buyback/page'));
const AdminUsersPage = lazyWithRetry(() => import('../pages/admin/users/page'));
const AdminMembersPage = lazyWithRetry(() => import('../pages/admin/members/page'));
const AdminBannersPage = lazyWithRetry(() => import('../pages/admin/banners/page'));
const AdminCollectionsPage = lazyWithRetry(() => import('../pages/admin/collections/page'));
const AdminCollectionFormPage = lazyWithRetry(() => import('../pages/admin/collections/form'));
const AdminCollectionProductsPage = lazyWithRetry(() => import('../pages/admin/collections/products'));
const AdminNewsPage = lazyWithRetry(() => import('../pages/admin/news/page'));
const AdminNewsFormPage = lazyWithRetry(() => import('../pages/admin/news/form'));
const AdminRecommendedPage = lazyWithRetry(() => import('../pages/admin/recommended/page'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/products',
    element: <ItemsPage />,
  },
  {
    path: '/product/:id',
    element: <ItemDetailPage />,
  },
  {
    path: '/cart',
    element: <CartPage />,
  },
  {
    path: '/checkout',
    element: <CheckoutPage />,
  },
  {
    path: '/order-complete',
    element: <OrderCompletePage />,
  },
  {
    path: '/mypage',
    element: <MyPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/impact',
    element: <ImpactPage />,
  },
  {
    path: '/system',
    element: <SystemPage />,
  },
  {
    path: '/buyback',
    element: <BuybackPage />,
  },
  {
    path: '/buyback/response/:id',
    element: <BuybackResponsePage />,
  },
  {
    path: '/news',
    element: <NewsPage />,
  },
  {
    path: '/news/:id',
    element: <NewsDetailPage />,
  },
  {
    path: '/features',
    element: <FeaturesPage />,
  },
  {
    path: '/features/:id',
    element: <FeatureDetailPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/faq',
    element: <FAQPage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: '',
        element: <AdminDashboardPage />,
      },
      {
        path: 'products',
        element: <AdminProductsPage />,
      },
      {
        path: 'products/new',
        element: <AdminProductFormPage />,
      },
      {
        path: 'products/:id/edit',
        element: <AdminProductFormPage />,
      },
      {
        path: 'orders',
        element: <AdminOrdersPage />,
      },
      {
        path: 'buyback',
        element: <AdminBuybackPage />,
      },
      {
        path: 'members',
        element: <AdminMembersPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'banners',
        element: <AdminBannersPage />,
      },
      {
        path: 'news',
        element: <AdminNewsPage />,
      },
      {
        path: 'news/new',
        element: <AdminNewsFormPage />,
      },
      {
        path: 'news/:id/edit',
        element: <AdminNewsFormPage />,
      },
      {
        path: 'collections',
        element: <AdminCollectionsPage />,
      },
      {
        path: 'collections/new',
        element: <AdminCollectionFormPage />,
      },
      {
        path: 'collections/:id/edit',
        element: <AdminCollectionFormPage />,
      },
      {
        path: 'collections/:id',
        element: <AdminCollectionProductsPage />,
      },
      {
        path: 'collections/:id/recommended',
        element: <AdminRecommendedPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;

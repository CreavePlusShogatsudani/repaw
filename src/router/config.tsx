import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/home/page'));
const ItemsPage = lazy(() => import('../pages/items/page'));
const ItemDetailPage = lazy(() => import('../pages/item-detail/page'));
const CartPage = lazy(() => import('../pages/cart/page'));
const CheckoutPage = lazy(() => import('../pages/checkout/page'));
const OrderCompletePage = lazy(() => import('../pages/order-complete/page'));
const MyPage = lazy(() => import('../pages/mypage/page'));
const LoginPage = lazy(() => import('../pages/login/page'));
const SignupPage = lazy(() => import('../pages/signup/page'));
const ForgotPasswordPage = lazy(() => import('../pages/forgot-password/page'));
const ImpactPage = lazy(() => import('../pages/impact/page'));
const SystemPage = lazy(() => import('../pages/system/page'));
const BuybackPage = lazy(() => import('../pages/buyback/page'));
const NewsPage = lazy(() => import('../pages/news/page'));
const NewsDetailPage = lazy(() => import('../pages/news-detail/page'));
const FeaturesPage = lazy(() => import('../pages/features/page'));
const FeatureDetailPage = lazy(() => import('../pages/feature-detail/page'));
const AboutPage = lazy(() => import('../pages/about/page'));
const FAQPage = lazy(() => import('../pages/faq/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Admin Pages
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const AdminDashboardPage = lazy(() => import('../pages/admin/dashboard/page'));
const AdminProductsPage = lazy(() => import('../pages/admin/products/page'));
const AdminProductFormPage = lazy(() => import('../pages/admin/products/form'));
const AdminOrdersPage = lazy(() => import('../pages/admin/orders/page'));
const AdminBuybackPage = lazy(() => import('../pages/admin/buyback/page'));
const AdminUsersPage = lazy(() => import('../pages/admin/users/page'));
const AdminBannersPage = lazy(() => import('../pages/admin/banners/page'));
const AdminCollectionsPage = lazy(() => import('../pages/admin/collections/page'));
const AdminCollectionProductsPage = lazy(() => import('../pages/admin/collections/products'));

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
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'banners',
        element: <AdminBannersPage />,
      },
      {
        path: 'collections',
        element: <AdminCollectionsPage />,
      },
      {
        path: 'collections/:id',
        element: <AdminCollectionProductsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;

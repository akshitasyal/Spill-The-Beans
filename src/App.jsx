import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import PageLoader from './components/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load standard pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Bundles = lazy(() => import('./pages/Bundles'));
const GiftPacks = lazy(() => import('./pages/GiftPacks'));
const Contact = lazy(() => import('./pages/Contact'));
const Blog = lazy(() => import('./pages/Blog'));
const RecipePage = lazy(() => import('./pages/RecipePage'));
const StoreCoffeePage = lazy(() => import('./pages/StoreCoffeePage'));
const IcedCoffeePage = lazy(() => import('./pages/IcedCoffeePage'));
const SpecialtyCoffeePage = lazy(() => import('./pages/SpecialtyCoffeePage'));
const DirectTradePage = lazy(() => import('./pages/DirectTradePage'));
const RoastLevelsPage = lazy(() => import('./pages/RoastLevelsPage'));
const FlavouredCoffeesPage = lazy(() => import('./pages/FlavouredCoffeesPage'));
const CoffeeProductivityPage = lazy(() => import('./pages/CoffeeProductivityPage'));
const NilgiriOriginPage = lazy(() => import('./pages/NilgiriOriginPage'));
const Cart = lazy(() => import('./pages/Cart'));
const Auth = lazy(() => import('./pages/Auth'));
const TrackPage = lazy(() => import('./pages/TrackPage'));
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'));
const ShippingPage = lazy(() => import('./pages/ShippingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const Profile = lazy(() => import('./pages/Profile'));

// Phase 5 Product Catalog Pages
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));

// Admin pages
const AdminProtect = lazy(() => import('./components/AdminProtect'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductsAdminPage = lazy(() => import('./pages/admin/ProductsPage'));
const ProductFormPage = lazy(() => import('./pages/admin/ProductFormPage'));
const CategoriesAdminPage = lazy(() => import('./pages/admin/CategoriesPage'));
const InventoryAdminPage = lazy(() => import('./pages/admin/InventoryPage'));
const OrdersAdminPage = lazy(() => import('./pages/admin/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/admin/OrderDetailPage'));
const CustomersAdminPage = lazy(() => import('./pages/admin/CustomersPage'));
const CustomerDetailPage = lazy(() => import('./pages/admin/CustomerDetailPage'));
const ReviewsAdminPage = lazy(() => import('./pages/admin/ReviewsPage'));
const CouponsAdminPage = lazy(() => import('./pages/admin/CouponsPage'));
const BlogsAdminPage = lazy(() => import('./pages/admin/BlogsPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/admin/ProfilePage'));
const ActivityPage = lazy(() => import('./pages/admin/ActivityPage'));
const NotificationsAdminPage = lazy(() => import('./pages/admin/NotificationsPage'));

// Error pages
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'));
const ServerErrorPage = lazy(() => import('./pages/errors/ServerErrorPage'));
const MaintenancePage = lazy(() => import('./pages/errors/MaintenancePage'));

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  // Check Maintenance Mode environment variable
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode && !isAdminPage) {
    return <MaintenancePage />;
  }

  return (
    <>
      {!isAdminPage && <Navbar />}
      {!isAdminPage && <CartDrawer />}
      <ErrorBoundary fallback={<ServerErrorPage />}>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/bundles" element={<Bundles />} />
              <Route path="/gifts" element={<GiftPacks />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/protein-coffee-recipe" element={<RecipePage />} />
              <Route path="/blog/how-to-store-coffee-beans-correctly" element={<StoreCoffeePage />} />
              <Route path="/blog/how-to-make-the-perfect-iced-latte" element={<IcedCoffeePage />} />
              <Route path="/blog/what-is-specialty-coffee" element={<SpecialtyCoffeePage />} />
              <Route path="/blog/why-we-only-source-direct-trade" element={<DirectTradePage />} />
              <Route path="/blog/guide-to-coffee-roast-levels" element={<RoastLevelsPage />} />
              <Route path="/blog/best-flavoured-coffees-india-2025" element={<FlavouredCoffeesPage />} />
              <Route path="/blog/coffee-and-productivity" element={<CoffeeProductivityPage />} />
              <Route path="/blog/nilgiri-hills-coffee-guide" element={<NilgiriOriginPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/track" element={<TrackPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Phase 5 Product Catalog Routes */}
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />

              {/* Admin Dashboard Routes */}
              <Route
                path="/admin"
                element={
                  <AdminProtect>
                    <AdminLayout />
                  </AdminProtect>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductsAdminPage />} />
                <Route path="products/new" element={<ProductFormPage />} />
                <Route path="products/:id/edit" element={<ProductFormPage />} />
                <Route path="categories" element={<CategoriesAdminPage />} />
                <Route path="inventory" element={<InventoryAdminPage />} />
                <Route path="orders" element={<OrdersAdminPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="customers" element={<CustomersAdminPage />} />
                <Route path="customers/:id" element={<CustomerDetailPage />} />
                <Route path="reviews" element={<ReviewsAdminPage />} />
                <Route path="coupons" element={<CouponsAdminPage />} />
                <Route path="blogs" element={<BlogsAdminPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="activity" element={<ActivityPage />} />
                <Route path="notifications" element={<NotificationsAdminPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
      {!isAdminPage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CurrencyProvider>
                <AppContent />
              </CurrencyProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

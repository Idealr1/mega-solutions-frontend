import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/MainLayout';

import HomePage from './components/HomePage';
import ProductsPage from './components/ProductsPage';
import ProductDetailsPage from './components/ProductDetailsPage';
import AboutPage from './components/AboutPage';
import GalleryPage from './components/GalleryPage';
import ContactPage from './components/ContactPage';
import BlogPage from './components/BlogPage';
import BlogPostPage from './components/BlogPostPage';
import B2BPage from './components/B2BPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import KarrotaVisualizer from './components/KarrotaVisualizer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminOrders from './components/admin/AdminOrders';
import AdminProducts from './components/admin/AdminProducts';
import AdminB2BApplications from './components/admin/AdminB2BApplications';
import AdminBlog from './components/admin/AdminBlog';
import AdminProductForm from './components/admin/AdminProductForm';
import AdminBlogPostForm from './components/admin/AdminBlogPostForm';
import AdminOffers from './components/admin/AdminOffers';
import AdminDownloads from './components/admin/AdminDownloads';
import AdminSubaccounts from './components/admin/AdminSubaccounts';
import AdminCategories from './components/admin/AdminCategories';
import AdminInquiries from './components/admin/AdminInquiries';
import AdminGallery from './components/admin/AdminGallery';
import AdminGalleryForm from './components/admin/AdminGalleryForm';
import AdminSubscribers from './components/admin/AdminSubscribers';
import AdminVisualizerUsage from './components/admin/AdminVisualizerUsage';
import CollaboratorDashboard from './components/collaborator/CollaboratorDashboard';
import CheckoutPage from './components/CheckoutPage';
import CollaboratorLayout from './components/collaborator/CollaboratorLayout';
import CollaboratorOrders from './components/collaborator/CollaboratorOrders';
import CollaboratorQuotes from './components/collaborator/CollaboratorQuotes';
import CollaboratorClaims from './components/collaborator/CollaboratorClaims';
import CollaboratorQuickOrder from './components/collaborator/CollaboratorQuickOrder';
import CollaboratorAddresses from './components/collaborator/CollaboratorAddresses';
import CollaboratorDownloads from './components/collaborator/CollaboratorDownloads';
import CollaboratorSubaccounts from './components/collaborator/CollaboratorSubaccounts';
import CollaboratorWallet from './components/collaborator/CollaboratorWallet';
import CollaboratorOffers from './components/collaborator/CollaboratorOffers';
import CollaboratorInvoices from './components/collaborator/CollaboratorInvoices';
import UserDashboard from './components/user/UserDashboard';

function App() {
  useEffect(() => {
    console.log('API Service initialized with base URL:', import.meta.env.VITE_API_BASE_URL);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public Routes with Main Navbar/Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/blog/:id" element={<BlogPostPage />} />
            <Route path="/b2b" element={<B2BPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/karrota-visualizer" element={
              <ProtectedRoute>
                <KarrotaVisualizer />
              </ProtectedRoute>
            } />

            {/* User Dashboard also gets the main Navbar/Footer */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
          </Route>

          {/* Collaborator Routes (Independent Layout) */}
          <Route path="/collaborator" element={
            <ProtectedRoute requiredRole="collaborator">
              <CollaboratorLayout />
            </ProtectedRoute>
          }>
            <Route index element={<CollaboratorDashboard />} />
            <Route path="orders" element={<CollaboratorOrders />} />
            <Route path="quotes" element={<CollaboratorQuotes />} />
            <Route path="claims" element={<CollaboratorClaims />} />
            <Route path="quick-order" element={<CollaboratorQuickOrder />} />
            <Route path="addresses" element={<CollaboratorAddresses />} />
            <Route path="downloads" element={<CollaboratorDownloads />} />
            <Route path="subaccounts" element={<CollaboratorSubaccounts />} />
            <Route path="wallet" element={<CollaboratorWallet />} />
            <Route path="offers" element={<CollaboratorOffers />} />
            <Route path="invoices" element={<CollaboratorInvoices />} />
          </Route>

          {/* Admin Routes (Independent Layout) */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="applications" element={<AdminB2BApplications />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="blog/new" element={<AdminBlogPostForm />} />
            <Route path="blog/:id/edit" element={<AdminBlogPostForm />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="downloads" element={<AdminDownloads />} />
            <Route path="subaccounts" element={<AdminSubaccounts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="gallery/new" element={<AdminGalleryForm />} />
            <Route path="gallery/:id/edit" element={<AdminGalleryForm />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
            <Route path="visualizer" element={<AdminVisualizerUsage />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

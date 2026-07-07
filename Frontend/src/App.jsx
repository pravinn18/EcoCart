import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import AddProduct from "./pages/AddProduct";
import AdminPage from "./pages/AdminPage";
import AdminDashboard from "./pages/AdminDashboard";
import CheckoutAddress from "./pages/CheckoutAddress";
import CheckoutPayment from "./pages/CheckoutPayment";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import CategoryProducts from "./pages/CategoryProducts";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Terms from "./pages/Terms";
import PlusPage from "./pages/PlusPage";
import SearchResults from "./pages/SearchResults";
import SplashScreen from "./components/SplashScreen";
import LifestyleProducts from "./pages/LifestyleProducts";

const Dashboard = () => <h1>Dashboard</h1>;

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";
  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Header />}
      <main className="flex-grow">{children}</main>
      {!isAuthPage && <Footer />}
    </div>
  );
};



function App() {
  const [splashDone, setSplashDone] = useState(() => {
    return sessionStorage.getItem("splashDone") === "true";
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem("splashDone", "true");
    setSplashDone(true);
  };

  if (!splashDone) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <WishlistProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route
                path="/category/:categoryName"
                element={<CategoryProducts />}
              />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout/address" element={<CheckoutAddress />} />
              <Route path="/checkout/payment" element={<CheckoutPayment />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/plus" element={<PlusPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/add-product" element={<AddProduct />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/lifestyle/:name" element={<LifestyleProducts />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </WishlistProvider>
  );
}

export default App;

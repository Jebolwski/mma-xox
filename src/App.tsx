import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import "./i18n/i18n";
import { Suspense, useEffect, lazy } from "react";
import ReactGA from "react-ga4";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";

// Lazy load secondary pages
const AvailableRooms = lazy(() => import("./pages/AvailableRooms"));
const Profile = lazy(() => import("./pages/Profile"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const WorldRanking = lazy(() => import("./pages/WorldRanking"));
const Friends = lazy(() => import("./pages/Friends"));
const Menu = lazy(() => import("./pages/Menu"));
const SameScreenGame = lazy(() => import("./pages/SameScreenGame"));
const Room = lazy(() => import("./pages/Room"));

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./components/Footer";
import Header from "./components/Header";
import LoadingFallback from "./components/LoadingFallback";

function AppContent() {
  // Protected wrapper: user yoksa Login'e at
  const ProtectedRoute = ({ children }: { children: any }) => {
    const { currentUser } = useAuth();
    const location = useLocation();
    if (!currentUser) {
      return (
        <Navigate
          to="/login"
          replace
          state={{ from: location }}
        />
      );
    }
    return children;
  };

  const ProtectedRouteReverse = ({ children }: { children: any }) => {
    const { currentUser } = useAuth();
    const location = useLocation();
    if (currentUser) {
      return (
        <Navigate
          to="/menu"
          replace
          state={{ from: location }}
        />
      );
    }
    return children;
  };

  const location = useLocation();

  // Track page views
  useEffect(() => {
    ReactGA.event("page_view", {
      page_path: location.pathname,
      page_title: document.title,
    });
  }, [location.pathname]);

  return (
    <>
      {!location.pathname.startsWith("/room/") &&
        !location.pathname.startsWith("/same-screen") && <Header />}
      <Routes>
        {/* public */}
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/login"
          element={
            <ProtectedRouteReverse>
              <Login />
            </ProtectedRouteReverse>
          }
        />
        <Route
          path="/menu"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Menu />
            </Suspense>
          }
        />
        <Route
          path="/same-screen"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <SameScreenGame />
            </Suspense>
          }
        />
        <Route
          path="/room/:roomId"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Room />
            </Suspense>
          }
        />
        <Route
          path="/available-rooms"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AvailableRooms />
            </Suspense>
          }
        />

        {/* protected */}
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <Profile />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/world-ranking"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <WorldRanking />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <Friends />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* other lazy routes */}
        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ResetPassword />
            </Suspense>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Privacy />
            </Suspense>
          }
        />
        <Route
          path="/terms-of-service"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Terms />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="/contact"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Contact />
            </Suspense>
          }
        />

        {/* 404 Not Found */}
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </Suspense>
  );
}

export default App;

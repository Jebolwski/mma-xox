import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // EKLENDI
import Home from "./pages/Home";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import SameScreenGame from "./pages/SameScreenGame";
import Room from "./pages/Room";
import AvailableRooms from "./pages/AvailableRooms";
import Profile from "./pages/Profile"; // EKLENDI
import { ThemeProvider } from "./context/ThemeContext";
import { AdProvider } from "./context/AdContext";
import { AuthProvider } from "./context/AuthContext"; // EKLENDI
import WorldRanking from "./pages/WorldRanking";
import Friends from "./pages/Friends";

function App() {
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

  return (
    <AuthProvider>
      <ThemeProvider>
        <AdProvider>
          <BrowserRouter>
            <Routes>
              {/* public */}
              <Route
                path="/"
                element={<Home />}
              />
              <Route
                path="/login"
                element={<Login />}
              />
              <Route
                path="/menu"
                element={<Menu />}
              />
              <Route
                path="/same-screen"
                element={<SameScreenGame />}
              />
              <Route
                path="/available-rooms"
                element={<AvailableRooms />}
              />

              {/* protected */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/world-ranking"
                element={
                  <ProtectedRoute>
                    <WorldRanking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/friends"
                element={
                  <ProtectedRoute>
                    <Friends />
                  </ProtectedRoute>
                }
              />

              {/* diğerleri (isteğe göre koruyabilirsin) */}
              <Route
                path="/room/:roomId"
                element={<Room />}
              />
            </Routes>
          </BrowserRouter>
        </AdProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

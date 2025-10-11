import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
  return (
    <AuthProvider>
      <ThemeProvider>
        <AdProvider>
          <BrowserRouter>
            <Routes>
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
                path="/profile"
                element={<Profile />}
              />{" "}
              {/* EKLENDI */}
              <Route
                path="/same-screen"
                element={<SameScreenGame />}
              />
              <Route
                path="/world-ranking"
                element={<WorldRanking />}
              />
              <Route
                path="/friends"
                element={<Friends />}
              />
              <Route
                path="/room/:roomId"
                element={<Room />}
              />
              <Route
                path="/available-rooms"
                element={<AvailableRooms />}
              />
            </Routes>
          </BrowserRouter>
        </AdProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

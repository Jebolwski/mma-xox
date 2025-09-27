import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import SameScreenGame from "./pages/SameScreenGame";
import Room from "./pages/Room";
import AvailableRooms from "./pages/AvailableRooms";
import { ThemeProvider } from "./context/ThemeContext";
import { AdProvider } from "./context/AdContext";
import { AuthProvider } from "./context/AuthContext"; // EKLENDI

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
                path="/same-screen"
                element={<SameScreenGame />}
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

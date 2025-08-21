import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Room from "./pages/Room";
import Menu from "./pages/Menu";
import SameScreenGame from "./pages/SameScreenGame";
import { ThemeProvider } from "./context/ThemeContext";
import { AdProvider } from "./context/AdContext";
import Home from "./pages/Home";

function App() {
  return (
    <ThemeProvider>
      <AdProvider>
        <Router>
          <ToastContainer
            position="bottom-right"
            theme="dark"
          />
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />
            <Route
              path="/menu"
              element={<Menu />}
            />
            <Route
              path="/room/:roomId"
              element={<Room />}
            />
            <Route
              path="/same-screen"
              element={<SameScreenGame />}
            />
          </Routes>
        </Router>
      </AdProvider>
    </ThemeProvider>
  );
}

export default App;

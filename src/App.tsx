import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Room from "./pages/Room";
import Menu from "./pages/Menu";
import SameScreenGame from "./pages/SameScreenGame";
import { ThemeProvider } from "./context/ThemeContext"; // doğru path'e göre güncelle

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ToastContainer
          position="bottom-right"
          theme="dark"
        />
        <Routes>
          <Route
            path="/"
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
    </ThemeProvider>
  );
}

export default App;

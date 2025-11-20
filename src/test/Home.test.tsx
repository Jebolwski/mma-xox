import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import { AdProvider } from "../context/AdContext";
import Home from "../pages/Home";

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
        <AdProvider>{children}</AdProvider>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe("Home Component", () => {
  it("renders without crashing", () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Check if the component renders without throwing
    expect(document.body).toBeInTheDocument();
  });

  it("should have MMA XOX title", () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Look for MMA XOX text in the document
    const title = screen.getByText(/MMA XOX/i);
    expect(title).toBeInTheDocument();
  });
});

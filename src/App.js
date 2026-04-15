import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import LoginAdmin from "./pages/LoginAdmin";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#E63946" },
    background: { default: "#0a0a0a", paper: "#111111" },
  },
  typography: { fontFamily: "'Inter', sans-serif" },
  shape: { borderRadius: 12 },
});

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem("adminAuth") === "true";
  return isAuth ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginAdmin />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

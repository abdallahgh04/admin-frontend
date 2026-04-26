import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Typography, IconButton, Stack, Divider, Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const DRAWER_FULL = 240;
const DRAWER_MINI = 72;

const NAV = [
  { label: "Dashboard", icon: <DashboardIcon />, to: "/" },
  { label: "Produits", icon: <InventoryIcon />, to: "/products" },
  { label: "Commandes", icon: <ShoppingCartIcon />, to: "/orders" },
  { label: "Utilisateurs", icon: <PeopleIcon />, to: "/users" },
];

export default function Layout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0a0a0a" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? DRAWER_FULL : DRAWER_MINI,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? DRAWER_FULL : DRAWER_MINI,
            bgcolor: "#111",
            border: "none",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            transition: "width 0.3s ease",
            overflow: "hidden",
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: open ? "space-between" : "center", minHeight: 64 }}>
          {open && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 32, height: 32, bgcolor: "#E63946", borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>S</Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: 0.5 }}>
                SayaraTech <Box component="span" sx={{ color: "#E63946" }}>Console</Box>
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 1 }}>
                Centre de commande
              </Typography>
            </Stack>
          )}
          <IconButton onClick={() => setOpen(!open)} size="small" sx={{ color: "rgba(255,255,255,0.5)" }}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* Nav */}
        <List sx={{ px: 1, pt: 2, flex: 1 }}>
          {NAV.map(({ label, icon, to }) => {
            const active = location.pathname === to;
            return (
              <Tooltip title={!open ? label : ""} placement="right" key={to}>
                <ListItem
                  button
                  component={Link}
                  to={to}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    px: open ? 2 : 1.5,
                    justifyContent: open ? "flex-start" : "center",
                    bgcolor: active ? "rgba(230,57,70,0.15)" : "transparent",
                    border: active ? "1px solid rgba(230,57,70,0.3)" : "1px solid transparent",
                    "&:hover": { bgcolor: "rgba(230,57,70,0.1)" },
                    transition: "all 0.2s",
                  }}
                >
                  <ListItemIcon sx={{ color: active ? "#E63946" : "rgba(255,255,255,0.5)", minWidth: open ? 40 : "auto" }}>
                    {icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: active ? 700 : 500,
                        color: active ? "#E63946" : "rgba(255,255,255,0.8)",
                      }}
                    />
                  )}
                </ListItem>
              </Tooltip>
            );
          })}
        </List>

        {/* Logout */}
        <Box sx={{ p: 1, pb: 2 }}>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 1 }} />
          <Tooltip title={!open ? "Déconnexion" : ""} placement="right">
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                px: open ? 2 : 1.5,
                justifyContent: open ? "flex-start" : "center",
                "&:hover": { bgcolor: "rgba(230,57,70,0.1)" },
              }}
            >
              <ListItemIcon sx={{ color: "rgba(255,255,255,0.4)", minWidth: open ? 40 : "auto" }}>
                <LogoutIcon />
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary="Déconnexion"
                  primaryTypographyProps={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}
                />
              )}
            </ListItem>
          </Tooltip>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#0a0a0a" }}>
        <Outlet />
      </Box>
    </Box>
  );
}

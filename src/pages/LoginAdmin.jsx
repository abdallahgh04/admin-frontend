// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, Stack,
  Alert, InputAdornment, IconButton, Divider,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

export default function LoginAdmin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Login avec Strapi pour obtenir un vrai JWT
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: username, password }),
      });
      const data = await res.json();
      if (data.error || !data.jwt) {
        setError("Identifiants incorrects.");
        setLoading(false);
        return;
      }
      localStorage.setItem("adminAuth", "true");
      localStorage.setItem("adminToken", data.jwt);
      localStorage.setItem("adminName", data.user?.username || username);
      navigate("/");
    } catch {
      setError("Erreur de connexion au serveur.");
    }
    setLoading(false);
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#fff", bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2,
      "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
      "&:hover fieldset": { borderColor: "#E63946" },
      "&.Mui-focused fieldset": { borderColor: "#E63946", borderWidth: 2 },
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#E63946" },
  };

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex",
      background: "radial-gradient(ellipse at 20% 50%, rgba(230,57,70,0.06) 0%, transparent 60%), #080808",
    }}>
      {/* Left panel */}
      <Box sx={{
        display: { xs: "none", md: "flex" }, flex: 1,
        background: "linear-gradient(145deg, #0d0d0d 0%, #1a0000 60%, #0d0d0d 100%)",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        p: 6, position: "relative", overflow: "hidden",
        borderRight: "1px solid rgba(230,57,70,0.1)",
      }}>
        {[200, 350, 500].map((size, i) => (
          <Box key={i} sx={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: "1px solid rgba(230,57,70,0.08)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        ))}
        <Stack alignItems="center" spacing={3} sx={{ position: "relative" }}>
          <Box sx={{ width: 80, height: 80, borderRadius: 3, bgcolor: "#E63946", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 50px rgba(230,57,70,0.4)" }}>
            <DirectionsCarIcon sx={{ fontSize: 42, color: "#fff" }} />
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: 3 }}>
              SAYARA<Box component="span" sx={{ color: "#E63946" }}>TECH</Box>
            </Typography>
            <Typography sx={{ color: "#E63946", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, mt: 0.3 }}>
              Console
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 11, letterSpacing: 2, mt: 0.3 }}>
              Centre de commande
            </Typography>
          </Box>
          <Divider sx={{ width: 60, borderColor: "rgba(230,57,70,0.3)" }} />
          <Stack spacing={2} sx={{ width: "100%", maxWidth: 280 }}>
            {[
              { icon: "📊", text: "Dashboard & statistiques" },
              { icon: "📦", text: "Gestion des produits" },
              { icon: "🛒", text: "Suivi des commandes" },
              { icon: "👥", text: "Gestion des utilisateurs" },
            ].map((item) => (
              <Stack key={item.text} direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width: 32, height: 32, bgcolor: "rgba(230,57,70,0.1)", borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                  {item.icon}
                </Box>
                <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{item.text}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* Right form */}
      <Box sx={{ flex: { xs: 1, md: "0 0 480px" }, display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 3, sm: 5 } }}>
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile logo */}
          <Stack alignItems="center" mb={4} sx={{ display: { md: "none" } }}>
            <Box sx={{ width: 56, height: 56, bgcolor: "#E63946", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5, boxShadow: "0 0 30px rgba(230,57,70,0.4)" }}>
              <DirectionsCarIcon sx={{ fontSize: 28, color: "#fff" }} />
            </Box>
            <Typography fontWeight={900} fontSize={20} color="#fff">
              SAYARA<Box component="span" sx={{ color: "#E63946" }}>TECH</Box>
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
            <AdminPanelSettingsIcon sx={{ color: "#E63946", fontSize: 28 }} />
            <Typography variant="h5" fontWeight={900} color="#fff">Connexion Admin</Typography>
          </Stack>
          <Typography color="rgba(255,255,255,0.3)" fontSize={13} mb={4}>
            Accès réservé aux administrateurs autorisés
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", "& .MuiAlert-icon": { color: "#ef4444" } }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <Stack spacing={2.5}>
              <TextField
                label="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                autoComplete="username"
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 20 }} /></InputAdornment>,
                }}
              />
              <TextField
                label="Mot de passe"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                autoComplete="current-password"
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 20 }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(!showPass)} size="small" sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "#E63946" } }}>
                        {showPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !username || !password}
                sx={{
                  bgcolor: "#E63946", fontWeight: 800, py: 1.6, borderRadius: 2.5,
                  textTransform: "none", fontSize: 15, mt: 1,
                  "&:hover": { bgcolor: "#c62828" },
                  "&:disabled": { bgcolor: "rgba(230,57,70,0.3)", color: "rgba(255,255,255,0.3)" },
                  boxShadow: "0 8px 24px rgba(230,57,70,0.3)",
                }}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 4, p: 2, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)" }}>
            <Typography fontSize={11} color="rgba(255,255,255,0.3)" textAlign="center">
              Utilisez vos identifiants Strapi (email ou username)
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

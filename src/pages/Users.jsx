// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Stack, Chip, Tabs, Tab,
  Table, TableHead, TableRow, TableCell, TableBody,
  Avatar, CircularProgress, Alert, Snackbar, Tooltip, IconButton,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedIcon from "@mui/icons-material/Verified";

const API = process.env.REACT_APP_API_URL;
const STRAPI_TOKEN = process.env.REACT_APP_STRAPI_TOKEN;
const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${STRAPI_TOKEN}` };

export default function Users() {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API}/admin/users`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => {
        console.log("all users:", Array.isArray(data) ? data.map(u => ({ id: u.id, email: u.email, vendeurStatus: u.vendeurStatus })) : data);
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(err => { console.error(err); setUsers([]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const acheteurs = users.filter(u => u.vendeurStatus !== "approved");
  const vendeurs  = users.filter(u => u.vendeurStatus === "approved");
  const currentList = tab === 0 ? acheteurs : vendeurs;

  const handleApprove = async (userId) => {
    try {
      await fetch(`${API}/users/${userId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ vendeurStatus: "approved" }),
      });
      setSnack({ open: true, msg: "Vendeur approuvé ✓", severity: "success" });
      fetchUsers();
    } catch {
      setSnack({ open: true, msg: "Erreur lors de l'approbation", severity: "error" });
    }
  };

  const handleReject = async (userId) => {
    try {
      await fetch(`${API}/users/${userId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ vendeurStatus: null }),
      });
      setSnack({ open: true, msg: "Utilisateur rétrogradé en acheteur", severity: "warning" });
      fetchUsers();
    } catch {
      setSnack({ open: true, msg: "Erreur lors du changement", severity: "error" });
    }
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <CircularProgress sx={{ color: "#E63946" }} />
    </Box>
  );

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#fff">Gestion des utilisateurs</Typography>
          <Typography fontSize={13} color="rgba(255,255,255,0.4)">
            {users.length} utilisateurs · {vendeurs.length} vendeur(s) actifs
          </Typography>
        </Box>
      </Stack>

      {/* Stats */}
      <Stack direction="row" spacing={2} mb={4}>
        {[
          { label: "Acheteurs", value: acheteurs.length, color: "#3b82f6", icon: <PersonIcon /> },
          { label: "Vendeurs actifs", value: vendeurs.length, color: "#10b981", icon: <StoreIcon /> },
          { label: "Total", value: users.length, color: "#E63946", icon: <PersonIcon /> },
        ].map(s => (
          <Paper key={s.label} sx={{ p: 2.5, flex: 1, bgcolor: "#111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3, position: "relative", overflow: "hidden",
            "&::before": { content: '""', position: "absolute", top: 0, left: 0, width: 4, height: "100%", bgcolor: s.color } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ color: s.color }}>{s.value}</Typography>
                <Typography fontSize={12} color="rgba(255,255,255,0.4)" fontWeight={600}>{s.label}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: `${s.color}22`, border: `1px solid ${s.color}44`, width: 40, height: 40 }}>
                {React.cloneElement(s.icon, { sx: { color: s.color, fontSize: 20 } })}
              </Avatar>
            </Stack>
          </Paper>
        ))}
      </Stack>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3,
        "& .MuiTab-root": { color: "rgba(255,255,255,0.4)", textTransform: "none", fontWeight: 600 },
        "& .Mui-selected": { color: "#E63946" },
        "& .MuiTabs-indicator": { bgcolor: "#E63946" } }}>
        <Tab label={`Acheteurs (${acheteurs.length})`} />
        <Tab label={`Vendeurs (${vendeurs.length})`} />
      </Tabs>

      <Paper sx={{ bgcolor: "#111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#1a1a1a" }}>
              {["Utilisateur", "Email", "Statut", "Inscrit le", "Actions"].map(h => (
                <TableCell key={h} sx={{ color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentList.length === 0 && (
              <TableRow><TableCell colSpan={5} sx={{ textAlign: "center", py: 6, borderBottom: "none", color: "rgba(255,255,255,0.3)" }}>Aucun utilisateur</TableCell></TableRow>
            )}
            {currentList.map(u => (
              <TableRow key={u.id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.02)" }, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <TableCell sx={{ borderBottom: "none" }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: tab === 2 ? "rgba(16,185,129,0.2)" : "rgba(59,130,246,0.2)", fontSize: 14, color: tab === 2 ? "#10b981" : "#3b82f6" }}>
                      {(u.username || u.email || "?")[0].toUpperCase()}
                    </Avatar>
                    <Typography fontSize={13} fontWeight={600} color="#fff">{u.username || "—"}</Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ borderBottom: "none", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{u.email}</TableCell>
                <TableCell sx={{ borderBottom: "none" }}>
                  {u.vendeurStatus === "pending"
                    ? <Chip label="En attente" size="small" sx={{ bgcolor: "rgba(245,158,11,0.1)", color: "#f59e0b", fontWeight: 700, fontSize: 11 }} />
                    : u.vendeurStatus === "approved" || u.role?.type === "vendeur"
                    ? <Chip icon={<VerifiedIcon sx={{ fontSize: 12 }} />} label="Vendeur actif" size="small" sx={{ bgcolor: "rgba(16,185,129,0.1)", color: "#10b981", fontWeight: 700, fontSize: 11 }} />
                    : <Chip label="Acheteur" size="small" sx={{ bgcolor: "rgba(59,130,246,0.1)", color: "#3b82f6", fontWeight: 700, fontSize: 11 }} />
                  }
                </TableCell>
                <TableCell sx={{ borderBottom: "none", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-DZ") : "—"}
                </TableCell>
                <TableCell sx={{ borderBottom: "none" }}>
                  {tab === 0 ? (
                    <Tooltip title="Passer en Vendeur">
                      <IconButton size="small" onClick={() => handleApprove(u.id)} sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "#10b981" } }}>
                        <StoreIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Rétrograder en Acheteur">
                      <IconButton size="small" onClick={() => handleReject(u.id)} sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "#ef4444" } }}>
                        <BlockIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

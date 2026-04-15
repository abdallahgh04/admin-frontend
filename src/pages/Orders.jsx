// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, CircularProgress, Alert, Chip, Stack, TextField,
  InputAdornment, Select, MenuItem, FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const API = process.env.REACT_APP_API_URL || "http://localhost:1337/api";

const STATUS_CONFIG = {
  pending:   { label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  confirmed: { label: "Confirmé",   color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  shipped:   { label: "Expédié",    color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  delivered: { label: "Livré",      color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  cancelled: { label: "Annulé",     color: "#ef4444", bg: "rgba(239,68,68,0.1)"  },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = () => {
    fetch(`${API}/purchases?populate=*&pagination[limit]=200&sort=createdAt:desc`)
      .then((r) => r.json())
      .then((d) => setOrders(d.data || []))
      .catch(() => setError("Erreur de chargement"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await fetch(`${API}/purchases/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { status: newStatus } }),
      });
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, attributes: { ...o.attributes, status: newStatus } } : o)
      );
    } catch {
      alert("Erreur lors de la mise à jour");
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress sx={{ color: "#E63946" }} /></Box>;
  if (error) return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;

  const filtered = orders.filter((o) => {
    const a = o.attributes;
    const matchSearch = !search ||
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.phone?.includes(search) ||
      a.wilaya?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = filtered.reduce((s, o) => s + Number(o.attributes.totalPrice || 0), 0);

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#fff">Commandes</Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.4)">
            {filtered.length} commandes · {totalRevenue.toLocaleString()} DA
          </Typography>
        </Box>
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          placeholder="Nom, téléphone, wilaya..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            width: 280,
            "& .MuiOutlinedInput-root": {
              bgcolor: "#1a1a1a", borderRadius: 2, color: "#fff",
              "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
              "&:hover fieldset": { borderColor: "#E63946" },
            },
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }} /></InputAdornment>,
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ bgcolor: "#1a1a1a", color: "#fff", borderRadius: 2, "& fieldset": { borderColor: "rgba(255,255,255,0.1)" } }}
          >
            <MenuItem value="all">Tous les statuts</MenuItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Paper sx={{ bgcolor: "#111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#1a1a1a" }}>
              {["#", "Client", "Produit", "Qté", "Total", "Wilaya", "Statut", "Date"].map((h) => (
                <TableCell key={h} sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((o, i) => {
              const a = o.attributes;
              const status = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
              return (
                <TableRow key={o.id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.02)" }, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <TableCell sx={{ borderBottom: "none", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>#{o.id}</TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Typography fontSize={13} fontWeight={600} color="#fff">{a.name || "—"}</Typography>
                    <Typography fontSize={11} color="rgba(255,255,255,0.4)">{a.phone}</Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Typography fontSize={12} color="rgba(255,255,255,0.7)" sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.product?.data?.attributes?.productTitle || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Typography fontSize={13} fontWeight={700} color="#fff">{a.quantity}</Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Typography fontSize={13} fontWeight={700} color="#E63946">{Number(a.totalPrice || 0).toLocaleString()} DA</Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Typography fontSize={12} color="rgba(255,255,255,0.6)">{a.wilaya || "—"}</Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Select
                      value={a.status || "pending"}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      size="small"
                      sx={{
                        fontSize: 11, fontWeight: 700, height: 28,
                        bgcolor: status.bg, color: status.color,
                        borderRadius: 2, border: `1px solid ${status.color}40`,
                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        "& .MuiSvgIcon-root": { color: status.color },
                      }}
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <MenuItem key={k} value={k} sx={{ fontSize: 12 }}>{v.label}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Typography fontSize={11} color="rgba(255,255,255,0.4)">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString("fr-DZ") : "—"}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography color="rgba(255,255,255,0.3)">Aucune commande trouvée</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

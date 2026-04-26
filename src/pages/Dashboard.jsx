// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Paper, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Stack, Divider,
} from "@mui/material";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import StoreIcon from "@mui/icons-material/Store";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

const RED = "#E63946";
const PALETTE = [RED, "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

const STATUS_MAP = {
  pending:   { bg:"rgba(245,158,11,0.15)",  color:"#f59e0b", label:"En attente" },
  confirmed: { bg:"rgba(59,130,246,0.15)",  color:"#3b82f6", label:"Confirmée"  },
  shipped:   { bg:"rgba(139,92,246,0.15)",  color:"#8b5cf6", label:"Expédiée"   },
  delivered: { bg:"rgba(16,185,129,0.15)",  color:"#10b981", label:"Livrée"     },
  cancelled: { bg:"rgba(239,68,68,0.15)",   color:"#ef4444", label:"Annulée"    },
};

function KCard({ icon, color, label, value, sub }) {
  return (
    <Paper elevation={0} sx={{
      p: 2.5, borderRadius: 3,
      bgcolor: "#111",
      border: "1px solid rgba(255,255,255,0.07)",
      position: "relative", overflow: "hidden",
      transition: "transform 0.2s",
      "&:hover": { transform: "translateY(-2px)", border: `1px solid ${color}55` },
      "&::before": { content:'""', position:"absolute", top:0, left:0, width:3, height:"100%", bgcolor: color },
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography sx={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, mb:0.8 }}>
            {label}
          </Typography>
          <Typography sx={{ color:"#fff", fontSize:28, fontWeight:900, lineHeight:1 }}>
            {value}
          </Typography>
          {sub && <Typography sx={{ color:"rgba(255,255,255,0.3)", fontSize:11, mt:0.6 }}>{sub}</Typography>}
        </Box>
        <Box sx={{ width:46, height:46, borderRadius:2, bgcolor:`${color}18`, border:`1px solid ${color}33`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          {React.cloneElement(icon, { sx:{ color, fontSize:22 } })}
        </Box>
      </Stack>
    </Paper>
  );
}

export default function Dashboard() {
  const [products,  setProducts]  = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const codes    = (() => { try { return JSON.parse(localStorage.getItem("inviteCodes")||"[]"); } catch { return []; } })();
  const used     = codes.filter(c => c.used);
  const clients  = used.filter(c => c.role === "client");
  const vendeurs = used.filter(c => c.role === "vendeur");
  const pending  = codes.filter(c => !c.used);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_API_URL}/products?populate=*&pagination[limit]=200`).then(r=>r.json()),
      fetch(`${process.env.REACT_APP_API_URL}/purchases?populate=*&pagination[limit]=200`).then(r=>r.json()),
    ]).then(([pd, pud]) => {
      setProducts(pd.data   || []);
      setPurchases(pud.data || []);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", bgcolor:"#0a0a0a" }}>
      <CircularProgress sx={{ color: RED }} size={36}/>
    </Box>
  );

  const totalRevenue = purchases.reduce((s,p) => s + Number(p.attributes?.totalPrice||0), 0);

  const monthlySales = {};
  purchases.forEach(p => {
    const k = new Date(p.attributes?.createdAt).toLocaleString("fr-FR",{month:"short",year:"2-digit"});
    monthlySales[k] = (monthlySales[k]||0) + (p.attributes?.quantity||0);
  });
  const monthlyData = Object.entries(monthlySales).map(([month,sales])=>({month,sales}));

  const topProducts = products.map(p => ({
    name: (p.attributes?.productTitle||"?").slice(0,14),
    sold: purchases.filter(pu=>pu.attributes?.product?.data?.id===p.id).reduce((s,pu)=>s+(pu.attributes?.quantity||0),0),
  })).sort((a,b)=>b.sold-a.sold).slice(0,6);

  const wilayaMap = {};
  purchases.forEach(p=>{ const w=p.attributes?.wilaya; if(w) wilayaMap[w]=(wilayaMap[w]||0)+1; });
  const wilayaData = Object.entries(wilayaMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,value])=>({name,value}));

  const latest = [...purchases].sort((a,b)=>new Date(b.attributes?.createdAt)-new Date(a.attributes?.createdAt)).slice(0,6);
  const lowStock = products.filter(p=>(p.attributes?.stock||0)<5).length;

  return (
    <Box sx={{ p:4, bgcolor:"#0a0a0a", minHeight:"100vh" }}>

      {/* ── Top bar ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Box>
          <Typography sx={{ color:"#fff", fontSize:22, fontWeight:900, letterSpacing:-0.5 }}>Tableau de bord</Typography>
          <Typography sx={{ color:"rgba(255,255,255,0.3)", fontSize:13, mt:0.3 }}>SayaraTech DZ — vue d'ensemble</Typography>
        </Box>
        <Box sx={{ px:2, py:0.8, bgcolor:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:2 }}>
          <Typography sx={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>
            {new Date().toLocaleDateString("fr-DZ",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </Typography>
        </Box>
      </Stack>

      {/* ── Row 1 — 4 cards ── */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={3}><KCard icon={<InventoryIcon/>}    color={RED}       label="Produits"    value={products.length}  sub="en catalogue"/></Grid>
        <Grid item xs={12} sm={6} md={3}><KCard icon={<ShoppingCartIcon/>} color="#3b82f6"   label="Commandes"   value={purchases.length} sub="total"/></Grid>
        <Grid item xs={12} sm={6} md={3}><KCard icon={<AttachMoneyIcon/>}  color="#10b981"   label="Revenus"     value={`${totalRevenue.toLocaleString()} DA`} sub="chiffre d'affaires"/></Grid>
        <Grid item xs={12} sm={6} md={3}><KCard icon={<PeopleIcon/>}       color="#f59e0b"   label="Utilisateurs" value={used.length}     sub={`${clients.length} clients · ${vendeurs.length} vendeurs`}/></Grid>
      </Grid>

      {/* ── Row 2 — 4 cards ── */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}><KCard icon={<PersonIcon/>}     color="#8b5cf6" label="Clients actifs"   value={clients.length}  sub="inscrits"/></Grid>
        <Grid item xs={12} sm={6} md={3}><KCard icon={<StoreIcon/>}      color="#06b6d4" label="Vendeurs"          value={vendeurs.length} sub="comptes actifs"/></Grid>
        <Grid item xs={12} sm={6} md={3}><KCard icon={<VpnKeyIcon/>}     color="#f59e0b" label="Codes en attente"  value={pending.length}  sub="invitations"/></Grid>
        <Grid item xs={12} sm={6} md={3}><KCard icon={<TrendingUpIcon/>} color={RED}     label="Stock faible"      value={lowStock}        sub="produits < 5 unités"/></Grid>
      </Grid>

      {/* ── Charts row ── */}
      <Grid container spacing={3} mb={3}>

        {/* Area chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p:3, bgcolor:"#111", border:"1px solid rgba(255,255,255,0.07)", borderRadius:3 }}>
            <Typography sx={{ color:"#fff", fontWeight:800, fontSize:14, mb:2.5 }}>Évolution des ventes mensuelles</Typography>
            {monthlyData.length === 0
              ? <Empty h={220}/>
              : <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={RED} stopOpacity={0.35}/>
                        <stop offset="95%" stopColor={RED} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="month" tick={{fill:"rgba(255,255,255,0.35)",fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"rgba(255,255,255,0.35)",fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff",fontSize:12}}/>
                    <Area type="monotone" dataKey="sales" stroke={RED} strokeWidth={2.5} fill="url(#ag)" name="Ventes"/>
                  </AreaChart>
                </ResponsiveContainer>
            }
          </Paper>
        </Grid>

        {/* Pie chart */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p:3, bgcolor:"#111", border:"1px solid rgba(255,255,255,0.07)", borderRadius:3, height:"100%" }}>
            <Typography sx={{ color:"#fff", fontWeight:800, fontSize:14, mb:2.5 }}>Commandes par wilaya</Typography>
            {wilayaData.length === 0
              ? <Empty h={220}/>
              : <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={wilayaData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} dataKey="value" paddingAngle={3}>
                      {wilayaData.map((_,i)=><Cell key={i} fill={PALETTE[i%PALETTE.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff",fontSize:12}}/>
                    <Legend iconType="circle" iconSize={8} formatter={v=><span style={{color:"rgba(255,255,255,0.55)",fontSize:11}}>{v}</span>}/>
                  </PieChart>
                </ResponsiveContainer>
            }
          </Paper>
        </Grid>
      </Grid>

      {/* Bar chart */}
      <Paper elevation={0} sx={{ p:3, mb:3, bgcolor:"#111", border:"1px solid rgba(255,255,255,0.07)", borderRadius:3 }}>
        <Typography sx={{ color:"#fff", fontWeight:800, fontSize:14, mb:2.5 }}>Top produits vendus</Typography>
        {topProducts.length === 0
          ? <Empty h={180}/>
          : <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topProducts} margin={{top:0,right:10,bottom:0,left:-10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                <XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.35)",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"rgba(255,255,255,0.35)",fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff",fontSize:12}}/>
                <Bar dataKey="sold" name="Vendus" radius={[6,6,0,0]}>
                  {topProducts.map((_,i)=><Cell key={i} fill={PALETTE[i%PALETTE.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        }
      </Paper>

      {/* Dernières commandes */}
      <Paper elevation={0} sx={{ bgcolor:"#111", border:"1px solid rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden" }}>
        <Box sx={{ px:3, py:2.5 }}>
          <Typography sx={{ color:"#fff", fontWeight:800, fontSize:14 }}>Dernières commandes</Typography>
        </Box>
        <Divider sx={{ borderColor:"rgba(255,255,255,0.06)" }}/>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor:"#0d0d0d" }}>
              {["Produit","Qté","Total","Wilaya","Statut","Date"].map(h=>(
                <TableCell key={h} sx={{ color:"rgba(255,255,255,0.3)", fontWeight:700, fontSize:10, letterSpacing:1.2, textTransform:"uppercase", borderBottom:"1px solid rgba(255,255,255,0.06)", py:1.5 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {latest.length === 0 && (
              <TableRow><TableCell colSpan={6} sx={{ textAlign:"center", py:5, color:"rgba(255,255,255,0.2)", borderBottom:"none", fontSize:13 }}>Aucune commande</TableCell></TableRow>
            )}
            {latest.map(p => {
              const sc = STATUS_MAP[p.attributes?.status] || STATUS_MAP.pending;
              return (
                <TableRow key={p.id} sx={{ "&:hover":{ bgcolor:"rgba(255,255,255,0.025)" }, borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <TableCell sx={{ borderBottom:"none", color:"#fff", fontWeight:600, fontSize:13 }}>
                    {p.attributes?.product?.data?.attributes?.productTitle || "—"}
                  </TableCell>
                  <TableCell sx={{ borderBottom:"none", color:"rgba(255,255,255,0.55)", fontSize:13 }}>{p.attributes?.quantity}</TableCell>
                  <TableCell sx={{ borderBottom:"none", color:"#10b981", fontWeight:700, fontSize:13 }}>
                    {Number(p.attributes?.totalPrice||0).toLocaleString()} DA
                  </TableCell>
                  <TableCell sx={{ borderBottom:"none", color:"rgba(255,255,255,0.45)", fontSize:13 }}>{p.attributes?.wilaya||"—"}</TableCell>
                  <TableCell sx={{ borderBottom:"none" }}>
                    <Chip label={sc.label} size="small" sx={{ bgcolor:sc.bg, color:sc.color, fontWeight:700, fontSize:11, height:22 }}/>
                  </TableCell>
                  <TableCell sx={{ borderBottom:"none", color:"rgba(255,255,255,0.3)", fontSize:12 }}>
                    {new Date(p.attributes?.createdAt).toLocaleDateString("fr-DZ")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

function Empty({ h }) {
  return (
    <Box sx={{ height:h, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Typography sx={{ color:"rgba(255,255,255,0.15)", fontSize:13 }}>Aucune donnée disponible</Typography>
    </Box>
  );
}

import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Box, Container, Typography, Grid, Card, CardContent, Button, Stack, TextField, Alert } from "@mui/material"
import { alpha } from "@mui/material/styles"
import ShieldIcon from "@mui/icons-material/Shield"
import PeopleIcon from "@mui/icons-material/People"
import MapIcon from "@mui/icons-material/Map"
import { authApi } from "../api/auth"
import { setCredentials } from "../store/authSlice"

const SNNPR_COLORS = {
  primary: "#2E7D32",
  secondary: "#1976D2",
  accent: "#ED6C02",
  dark: "#263238",
  gray: "#546E7A",
  lightGray: "#F5F7FA",
  white: "#FFFFFF",
  water: "#E9F5FF",
}

const features = [
  {
    title: "Secure Case Management",
    description: "Keep child protection records safe with role-based access and audit trails.",
    icon: <ShieldIcon sx={{ color: SNNPR_COLORS.primary }} />,
  },
  {
    title: "Multi-Zone Coordination",
    description: "Coordinate across all SNNPR zones with unified dashboards and reports.",
    icon: <MapIcon sx={{ color: SNNPR_COLORS.secondary }} />,
  },
  {
    title: "Community Integration",
    description: "Engage local partners and NGOs to respond quickly and consistently.",
    icon: <PeopleIcon sx={{ color: SNNPR_COLORS.accent }} />,
  },
]

const LandingPage = () => {
  // Keep main canvas neutral; apply water tint only on navbar/footer
  const bgGradient = `linear-gradient(135deg, ${SNNPR_COLORS.white} 0%, ${alpha(SNNPR_COLORS.primary, 0.05)} 100%)`

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState("admin@test.com")
  const [password, setPassword] = useState("password123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInlineLogin = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await authApi.login({ email, password })
      if (!data?.token || !data?.user) {
        throw new Error("Invalid response from server")
      }
      dispatch(setCredentials({ user: data.user, token: data.token }))
      navigate("/dashboard")
    } catch (err) {
      setError(err?.message || "Login failed. Please check credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: SNNPR_COLORS.lightGray, background: bgGradient }}>
      {/* Navbar separated from body */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: alpha(SNNPR_COLORS.water, 0.92),
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${alpha(SNNPR_COLORS.primary, 0.12)}`,
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <ShieldIcon sx={{ color: SNNPR_COLORS.primary, fontSize: 32 }} />
              <Box>
                <Typography sx={{ color: SNNPR_COLORS.primary, fontWeight: 700 }}>Child Protection System</Typography>
                <Typography sx={{ color: SNNPR_COLORS.gray, fontSize: 13 }}>Southern Nations, Nationalities, and Peoples' Region</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button
                component={Link}
                to="/login"
                variant="text"
                sx={{
                  color: SNNPR_COLORS.gray,
                  position: "relative",
                  cursor: "pointer",
                  transition: "color 150ms ease",
                  '&::after': {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 6,
                    height: 2,
                    bgcolor: alpha(SNNPR_COLORS.primary, 0.5),
                    transform: "scaleX(0)",
                    transformOrigin: "center",
                    transition: "transform 180ms ease",
                  },
                  '&:hover': {
                    color: SNNPR_COLORS.primary,
                  },
                  '&:hover::after': {
                    transform: "scaleX(1)",
                  },
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/dashboard"
                variant="contained"
                sx={{
                  bgcolor: SNNPR_COLORS.primary,
                  position: "relative",
                  cursor: "pointer",
                  transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
                  '&:hover': {
                    bgcolor: alpha(SNNPR_COLORS.primary, 0.9),
                    boxShadow: `0 10px 20px ${alpha(SNNPR_COLORS.primary, 0.18)}`,
                    transform: "translateY(-2px)",
                  },
                  '&::after': {
                    content: '""',
                    position: "absolute",
                    left: 12,
                    right: 12,
                    bottom: 8,
                    height: 2,
                    bgcolor: alpha(SNNPR_COLORS.white, 0.85),
                    transform: "scaleX(0)",
                    transformOrigin: "center",
                    transition: "transform 180ms ease",
                  },
                  '&:hover::after': {
                    transform: "scaleX(1)",
                  },
                }}
              >
                Enter Portal
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 5, pb: 6 }}>

        {/* Hero */}
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Typography sx={{ color: SNNPR_COLORS.dark, fontSize: { xs: "2rem", md: "2.75rem" }, fontWeight: 700, lineHeight: 1.2 }}>
                Protecting children across SNNPR with one unified platform.
              </Typography>
              <Typography sx={{ color: SNNPR_COLORS.gray, fontSize: "1.05rem", lineHeight: 1.6 }}>
                Manage cases, coordinate zones, and collaborate with partners securely and efficiently.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  sx={{
                    bgcolor: SNNPR_COLORS.primary,
                    px: 3,
                    py: 1.2,
                    cursor: "pointer",
                    transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
                    '&:hover': {
                      bgcolor: alpha(SNNPR_COLORS.primary, 0.9),
                      boxShadow: `0 10px 20px ${alpha(SNNPR_COLORS.primary, 0.18)}`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  component={Link}
                  to="/reports"
                  variant="outlined"
                  sx={{
                    borderColor: SNNPR_COLORS.primary,
                    color: SNNPR_COLORS.primary,
                    px: 3,
                    py: 1.2,
                    cursor: "pointer",
                    transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
                    '&:hover': {
                      bgcolor: alpha(SNNPR_COLORS.primary, 0.08),
                      boxShadow: `0 10px 20px ${alpha(SNNPR_COLORS.primary, 0.12)}`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  View Reports
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 12px 30px ${alpha(SNNPR_COLORS.primary, 0.12)}`,
                  border: `1px solid ${alpha(SNNPR_COLORS.primary, 0.1)}`,
                  transition: "transform 180ms ease, box-shadow 180ms ease",
                  cursor: "pointer",
                  '&:hover': {
                    transform: "translateY(-4px)",
                    boxShadow: `0 16px 34px ${alpha(SNNPR_COLORS.primary, 0.16)}`,
                  },
                }}
              >
                <CardContent>
                  <Typography sx={{ color: SNNPR_COLORS.dark, mb: 2, fontWeight: 700 }}>Sign in</Typography>
                  <Typography sx={{ color: SNNPR_COLORS.gray, mb: 2, fontSize: 14 }}>
                    Enter your credentials to access the portal.
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                      {error}
                    </Alert>
                  )}

                  <Box component="form" noValidate onSubmit={handleInlineLogin}>
                    <Stack spacing={2}>
                      <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        fullWidth
                        autoComplete="email"
                      />
                      <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        fullWidth
                        autoComplete="current-password"
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                          bgcolor: SNNPR_COLORS.primary,
                          cursor: "pointer",
                          transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
                          '&:hover': {
                            bgcolor: alpha(SNNPR_COLORS.primary, 0.9),
                            boxShadow: `0 10px 20px ${alpha(SNNPR_COLORS.primary, 0.18)}`,
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        {loading ? "Signing in..." : "Sign in"}
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: `0 12px 30px ${alpha(SNNPR_COLORS.primary, 0.12)}`,
                  border: `1px solid ${alpha(SNNPR_COLORS.primary, 0.1)}`,
                  transition: "transform 180ms ease, box-shadow 180ms ease",
                  cursor: "pointer",
                  '&:hover': {
                    transform: "translateY(-4px)",
                    boxShadow: `0 16px 34px ${alpha(SNNPR_COLORS.primary, 0.16)}`,
                  },
                }}
              >
                <CardContent>
                  <Typography sx={{ color: SNNPR_COLORS.dark, mb: 1, fontWeight: 700 }}>Quick snapshot</Typography>
                  <Typography sx={{ color: SNNPR_COLORS.gray, mb: 3 }}>Cases, zones, and partners in one view.</Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 2 }}>
                    {[
                      { label: "Cases Managed", value: "2,150+" },
                      { label: "Zones Covered", value: "13" },
                      { label: "Active Users", value: "480+" },
                      { label: "Data Accuracy", value: "98.7%" },
                    ].map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(SNNPR_COLORS.primary, 0.05),
                          border: `1px solid ${alpha(SNNPR_COLORS.primary, 0.1)}`,
                          cursor: "pointer",
                          transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
                          '&:hover': {
                            transform: "translateY(-3px)",
                            boxShadow: `0 10px 18px ${alpha(SNNPR_COLORS.primary, 0.12)}`,
                            bgcolor: alpha(SNNPR_COLORS.primary, 0.08),
                          },
                        }}
                      >
                        <Typography sx={{ color: SNNPR_COLORS.dark, fontWeight: 700 }}>{item.value}</Typography>
                        <Typography sx={{ color: SNNPR_COLORS.gray, fontSize: 13 }}>{item.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* Features */}
        <Box sx={{ mt: 8 }}>
          <Typography sx={{ textAlign: "center", color: SNNPR_COLORS.dark, fontWeight: 700, mb: 1 }}>Built for regional teams</Typography>
          <Typography sx={{ textAlign: "center", color: SNNPR_COLORS.gray, mb: 4 }}>
            Three essentials to start strong.
          </Typography>
          <Grid container spacing={3}>
            {features.map((feat) => (
              <Grid item xs={12} md={4} key={feat.title}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    border: `1px solid ${alpha(SNNPR_COLORS.primary, 0.1)}`,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
                    p: 1,
                    cursor: "pointer",
                    transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                    '&:hover': {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 22px rgba(0,0,0,0.08)",
                      borderColor: alpha(SNNPR_COLORS.primary, 0.2),
                    },
                  }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                      {feat.icon}
                      <Typography sx={{ color: SNNPR_COLORS.dark, fontWeight: 700 }}>{feat.title}</Typography>
                    </Stack>
                    <Typography sx={{ color: SNNPR_COLORS.gray, lineHeight: 1.5 }}>{feat.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Container>

      {/* Footer (full width) */}
      <Box
        component="footer"
        sx={{
          mt: 6,
          py: 2.5,
          width: "100%",
          borderTop: `1px solid ${alpha(SNNPR_COLORS.primary, 0.12)}`,
          background: alpha(SNNPR_COLORS.water, 0.8),
          backdropFilter: "blur(6px)",
          boxShadow: `0 12px 26px ${alpha(SNNPR_COLORS.primary, 0.08)}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <ShieldIcon sx={{ color: SNNPR_COLORS.primary, fontSize: 28 }} />
                  <Typography sx={{ color: SNNPR_COLORS.dark, fontWeight: 700 }}>Child Protection System</Typography>
                </Stack>
                <Typography sx={{ color: SNNPR_COLORS.gray, lineHeight: 1.6 }}>
                  Southern Nations, Nationalities, and Peoples' Region platform for coordinated child safety.
                </Typography>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  sx={{
                    alignSelf: "flex-start",
                    bgcolor: SNNPR_COLORS.primary,
                    cursor: "pointer",
                    transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
                    '&:hover': {
                      bgcolor: alpha(SNNPR_COLORS.primary, 0.9),
                      boxShadow: `0 10px 20px ${alpha(SNNPR_COLORS.primary, 0.18)}`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Go to Login
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Stack spacing={1.5}>
                <Typography sx={{ color: SNNPR_COLORS.dark, fontWeight: 700 }}>Quick links</Typography>
                {[
                  { label: "Dashboard", to: "/dashboard" },
                  { label: "Cases", to: "/cases" },
                  { label: "Reports", to: "/reports" },
                ].map((link) => (
                  <Button
                    key={link.label}
                    component={Link}
                    to={link.to}
                    variant="text"
                    sx={{
                      justifyContent: "flex-start",
                      color: SNNPR_COLORS.gray,
                      px: 0,
                      textTransform: "none",
                      cursor: "pointer",
                      transition: "color 140ms ease, transform 140ms ease",
                      '&:hover': {
                        color: SNNPR_COLORS.primary,
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Stack spacing={1.5}>
                <Typography sx={{ color: SNNPR_COLORS.dark, fontWeight: 700 }}>Contact</Typography>
                <Typography sx={{ color: SNNPR_COLORS.gray }}>Regional Admin Desk</Typography>
                <Typography sx={{ color: SNNPR_COLORS.gray }}>Email: support@snnpr.gov.et</Typography>
                <Typography sx={{ color: SNNPR_COLORS.gray }}>Phone: +251-11-000-0000</Typography>
              </Stack>
            </Grid>
          </Grid>

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" sx={{ mt: 4 }}>
            <Typography sx={{ color: SNNPR_COLORS.gray, fontSize: 13 }}>© {new Date().getFullYear()} SNNPR Child Protection. All rights reserved.</Typography>
            <Typography sx={{ color: SNNPR_COLORS.gray, fontSize: 13 }}>Data handled securely with role-based access.</Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage

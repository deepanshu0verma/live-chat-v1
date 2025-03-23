import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { getUsers, login } from "../api/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // For displaying errors
  const navigate = useNavigate();

  // In handleLogin function:
  const handleLogin = async () => {
    setError("");
    try {
      const { token, userId } = await login({ username, password });
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      const users = await getUsers();
      const currentUser = users.find((u) => u._id === userId);
      localStorage.setItem("user", JSON.stringify(currentUser));
      navigate("/chat");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed, please try again";
      setError(errorMessage);
      console.error("Login error:", errorMessage);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 5, minHeight: "100vh" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Login
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            required
            margin="normal"
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            size="large"
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
          <Typography variant="body2" align="center">
            Don’t have an account?{" "}
            <Box
              component="a"
              href="/signup"
              sx={{
                color: "#1976d2",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Sign Up
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;

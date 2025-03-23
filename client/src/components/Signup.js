import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Grid2,
  Box,
  Alert,
  Paper,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { signup } from "../api/api";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Client-side username validation
  const validateUsername = (username) => {
    const minLength = 4;
    const hasNumber = /\d/.test(username);
    return username.length >= minLength && hasNumber;
  };

  const handleSignup = async () => {
    setError("");
    if (!validateUsername(username)) {
      setError(
        "Username must be at least 4 characters long and contain at least one number"
      );
      return;
    }

    const userData = {
      username,
      password,
      firstName,
      lastName,
      gender,
      age: parseInt(age),
      avatar: parseInt(avatar),
    };

    try {
      const { token, userId } = await signup(userData);
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      const users = await getUsers();
      const currentUser = users.find((u) => u._id === userId);
      localStorage.setItem("user", JSON.stringify(currentUser));
      navigate("/chat");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Signup failed, please try again";
      setError(errorMessage);
      console.error("Signup error:", errorMessage);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5, minHeight: "100vh" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom color="primary">
          Sign Up
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Username (e.g., john123)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              required
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              required
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              variant="outlined"
              required
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              variant="outlined"
              required
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <FormControl component="fieldset" required>
              <FormLabel component="legend">Gender</FormLabel>
              <RadioGroup
                row
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <FormControlLabel
                  value="Male"
                  control={<Radio />}
                  label="Male"
                />
                <FormControlLabel
                  value="Female"
                  control={<Radio />}
                  label="Female"
                />
                <FormControlLabel
                  value="Other"
                  control={<Radio />}
                  label="Other"
                />
              </RadioGroup>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              variant="outlined"
              required
              inputProps={{ min: 13 }}
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select Avatar
            </Typography>
            <Box display="flex" justifyContent="space-around" flexWrap="wrap">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <Box
                  key={num}
                  component="img"
                  src={`https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava${num}-bg.webp`}
                  alt={`Avatar ${num}`}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    cursor: "pointer",
                    border:
                      avatar === num ? "3px solid #1976d2" : "1px solid #ccc",
                    m: 1,
                    transition: "border 0.2s",
                    "&:hover": { border: "3px solid #1976d2" },
                  }}
                  onClick={() => setAvatar(num)}
                />
              ))}
            </Box>
          </Grid2>
        </Grid2>
        <Grid2 size={{ xs: 12 }} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleSignup}
            size="large"
            sx={{ mt: 2 }}
          >
            Sign Up
          </Button>
        </Grid2>
        <Grid2 size={{ xs: 12 }} textAlign="center">
          <Typography variant="body2">
            Already have an account?{" "}
            <Box
              component="a"
              href="/login"
              sx={{
                color: "#1976d2",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Login
            </Box>
          </Typography>
        </Grid2>
      </Paper>
    </Container>
  );
}

export default Signup;

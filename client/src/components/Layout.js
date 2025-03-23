import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import ChatBubbleTwoToneIcon from "@mui/icons-material/ChatBubbleTwoTone";
import { getUsers } from "../api/api";

function Layout() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (token && userId) {
      const fetchUser = async () => {
        try {
          const response = await getUsers();
          const currentUser = response.find((u) => u._id === userId);
          setUser(currentUser);
        } catch (error) {
          console.error("Error fetching user:", error);
          handleLogout();
        }
      };
      fetchUser();
    } else {
      setUser(null); // Ensure user is null if no token/userId
    }
  }, [token, userId]);

  const handleLogin = () => navigate("/login");
  const handleSignUp = () => navigate("/signup");
  const handleChat = () => navigate("/chat");
  const handleHome = () => navigate("/");

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setAnchorEl(null);
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={handleHome}
          >
            Chat App <ChatBubbleTwoToneIcon />
          </Typography>
          {user ? (
            <>
              <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                <Avatar
                  src={`https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava${user.avatar}-bg.webp`}
                  alt={`${user.firstName} ${user.lastName}`}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleChat}>Chat</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={handleLogin} sx={{ mr: 2 }}>
                Login
              </Button>
              <Button color="inherit" onClick={handleSignUp}>
                Sign Up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, mt: 8 }}>
        <Outlet /> {/* This renders the child routes */}
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "grey.900", color: "white", py: 2 }}>
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} Chat App. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default Layout;

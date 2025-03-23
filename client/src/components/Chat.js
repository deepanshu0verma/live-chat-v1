import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import {
  Container,
  Grid2,
  Paper,
  Typography,
  TextField,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Badge,
  InputAdornment,
} from "@mui/material";
import moment from "moment";
import SendIcon from "@mui/icons-material/Send";
import SearchIcon from "@mui/icons-material/Search";
import "./style.css";
import { getUsers } from "../api/api";

const socket = io(
  process.env.REACT_APP_CHAT_BASE_URL || "http://localhost:5001",
  { autoConnect: true }
);

function Chat() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentUserAvatar, setCurrentUserAvatar] = useState(null);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    socket.emit("authenticate", token);

    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        const filteredUsers = response.filter((u) => u._id !== userId);
        setUsers(filteredUsers);
        const currentUser = response.find((u) => u._id === userId);
        setCurrentUserAvatar(currentUser.avatar);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("loadMessages", (loadedMessages) => {
      console.log("Loaded messages:", loadedMessages);
      setMessages(loadedMessages);
    });

    socket.on("chatMessage", (msg) => {
      console.log("Received chat message:", msg);
      if (
        (msg.senderId === userId && msg.recipientId === selectedUser?._id) ||
        (msg.senderId === selectedUser?._id && msg.recipientId === userId)
      ) {
        setMessages((prev) => {
          const newMessages = [...prev, msg];
          console.log("Updated messages:", newMessages);
          return newMessages;
        });
      } else {
        console.log("Message ignored: Not for current conversation");
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      socket.off("connect");
      socket.off("loadMessages");
      socket.off("chatMessage");
      socket.off("connect_error");
    };
  }, [token, userId, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessages([]);
    socket.emit("getChatHistory", { recipientId: user._id });
  };

  const sendMessage = () => {
    if (input.trim() && selectedUser) {
      console.log("Sending message:", {
        recipientId: selectedUser._id,
        message: input,
      });
      socket.emit("chatMessage", {
        recipientId: selectedUser._id,
        message: input,
      });
      setInput("");
    } else {
      console.log("Cannot send: No input or no user selected");
    }
  };

  const getMessageAvatar = (senderId) => {
    if (senderId === userId) return currentUserAvatar;
    const user = users.find((u) => u._id === senderId);
    return user ? user.avatar : 1;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5, minHeight: "100vh" }}>
      <Grid2 container spacing={3}>
        {/* User List */}
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              height: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search users"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              <List>
                {users.map((user) => (
                  <Box key={user._id}>
                    <ListItem
                      button
                      onClick={() => handleUserSelect(user)}
                      selected={selectedUser?._id === user._id}
                      sx={{
                        "&:hover": { bgcolor: "#f5f5f5" },
                        transition: "background-color 0.2s ease",
                        bgcolor:
                          selectedUser?._id === user._id
                            ? "#cfb8b88a"
                            : "transparent",
                      }}
                    >
                      <ListItemAvatar>
                        {selectedUser?._id === user._id ? (
                          <Badge
                            overlap="circular"
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                            badgeContent={
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  bgcolor: "#5cc462",
                                  borderRadius: "50%",
                                }}
                              />
                            }
                          >
                            <Avatar
                              src={`https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava${user.avatar}-bg.webp`}
                              sx={{ width: 50, height: 50 }}
                            />
                          </Badge>
                        ) : (
                          <Avatar
                            src={`https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava${user.avatar}-bg.webp`}
                            sx={{ width: 50, height: 50 }}
                          />
                        )}
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${user.firstName} ${user.lastName}`}
                        secondary="Click to chat"
                        primaryTypographyProps={{ fontWeight: "bold" }}
                        secondaryTypographyProps={{ color: "text.secondary" }}
                      />
                    </ListItem>
                    <Divider />
                  </Box>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid2>

        {/* Chat Area */}
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              height: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {selectedUser ? (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Chatting with {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
                <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
                  {messages.map((msg) => (
                    <Box
                      key={msg.timestamp}
                      sx={{
                        display: "flex",
                        flexDirection:
                          msg.senderId === userId ? "row-reverse" : "row",
                        mb: 2,
                        alignItems: "flex-start",
                      }}
                    >
                      <Avatar
                        src={`https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava${getMessageAvatar(
                          msg.senderId
                        )}-bg.webp`}
                        sx={{
                          width: 40,
                          height: 40,
                          mr: msg.senderId === userId ? 0 : 2,
                          ml: msg.senderId === userId ? 2 : 0,
                        }}
                      />
                      <Box>
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1,
                            bgcolor:
                              msg.senderId === userId
                                ? "primary.main"
                                : "#f5f6f7",
                            color: msg.senderId === userId ? "#fff" : "#000",
                            borderRadius: 2,
                            maxWidth: "70%",
                          }}
                        >
                          <Typography variant="body1">{msg.message}</Typography>
                        </Paper>
                        {msg.timestamp && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5, display: "block" }}
                          >
                            {moment(msg.timestamp).format("h:mm A")} |{" "}
                            {moment(msg.timestamp).format("MMM D")}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>
                <Box display="flex" alignItems="center">
                  <Avatar
                    src={`https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava${currentUserAvatar}-bg.webp`}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type message"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    sx={{ mr: 1 }}
                  />
                  <IconButton color="primary" onClick={sendMessage}>
                    <SendIcon />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Typography
                variant="h6"
                align="center"
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Select a user to start chatting
              </Typography>
            )}
          </Paper>
        </Grid2>
      </Grid2>
    </Container>
  );
}

export default Chat;

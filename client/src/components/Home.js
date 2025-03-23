import { Typography, Container } from "@mui/material";

function Home() {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Welcome to Chat App
      </Typography>
      <Typography variant="body1" align="center">
        Please log in or sign up to start chatting with friends!
      </Typography>
    </Container>
  );
}

export default Home;

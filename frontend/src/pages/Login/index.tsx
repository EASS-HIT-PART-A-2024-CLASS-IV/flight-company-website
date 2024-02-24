import ServiceLocator from "api/service.locator";
import { FunctionComponent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { UserCreds } from "api/auth-service";
import { SessionTokens } from "../../api/auth-service/index";

interface LoginProps {}

const Login: FunctionComponent<LoginProps> = () => {
  const navigate = useNavigate();

  const navigateIfAlreadyLogin = (): void => {
    const sessionData: SessionTokens | null =
      ServiceLocator.authService.getSessionData();
    if (sessionData == null) {
      return;
    }
    switch (sessionData.role) {
      case "user":
        return navigate("/home");
      case "admin":
        return navigate("/create-fight");
      default:
        break;
    }
  };

  useEffect(() => {
    navigateIfAlreadyLogin();
  },[]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const user: UserCreds = {
      username: data.get("username")?.toString() ?? "",
      password: data.get("password")?.toString() ?? "",
    };
    ServiceLocator.authService.login(user)
    .then(() => navigateIfAlreadyLogin())
    .catch(error => console.error('Login failed:', error))
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" className="prevent-select">
            Login
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="User Name"
              name="username"
              autoComplete="username"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Login
            </Button>
            <Grid container>
              <Grid item>
                <Link href="/register" variant="body2">
                  {"Don't have an account? Register"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Login;

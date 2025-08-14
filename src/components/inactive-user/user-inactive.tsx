"use client";
import { JSX, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { paths } from "@/utils/paths.utils";
import { signOut, useSession } from "next-auth/react";
import ScreenLoader from "../common/screen-loading";
import { useRouter } from "next/navigation";
import nProgress from "nprogress";
import { minutesToMilliseconds } from "@/utils/time-converters.utils";

const UserInactive = (): JSX.Element => {
  const { status, data } = useSession();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  const checkPermissions = () => {
    if (status === "unauthenticated") {
      nProgress.start();
      router.replace(paths.auth.login);
      return;
    }

    if (!data) return;

    const { user } = data;

    if (user.status_id === 4) {
      setUserName(user.firstName);
      return;
    }
    nProgress.start();
    router.replace(paths.dashboard.overview);
  };

  useEffect(() => checkPermissions(), [status, data]);

  useEffect(() => {
    const timeOutId = setTimeout(
      async () => await signOut(),
      minutesToMilliseconds(0.1)
    );
    return () => clearTimeout(timeOutId);
  }, []);

  // const logoutHandler = async () => {
  //   await signOut();
  // };

  if (!userName || status === "unauthenticated") {
    return <ScreenLoader fullScreen />;
  }

  return (
    <Box
      component="main"
      sx={{
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        minHeight: "100%",
      }}
    >
      <Stack spacing={3} sx={{ alignItems: "center", maxWidth: "md" }}>
        <Box>
          <Box
            component="img"
            alt="illustration"
            src="/assets/Warning_2.gif"
            sx={{
              display: "inline-block",
              height: "auto",
              maxWidth: "100%",
              width: "400px",
            }}
          />
        </Box>
        <Typography variant="h5" sx={{ textAlign: "center" }}>
          {userName ? `Dear ${userName}` : "Hello user"}, Your account is
          currently suspended.
        </Typography>
        <Typography
          color="text.secondary"
          variant="body1"
          sx={{ textAlign: "center" }}
        >
          Please contact the system administrator(s).
        </Typography>
        {/* <Button onClick={logoutHandler} variant="contained">
          Logout
        </Button> */}
      </Stack>
    </Box>
  );
};

export default UserInactive;

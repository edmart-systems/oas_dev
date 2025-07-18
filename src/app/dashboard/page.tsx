import PageTitle from "@/components/dashboard/common/page-title";
import { Box, Stack, Typography } from "@mui/material";

const Page = () => {
  return (
    <Stack spacing={3}>
      <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
        <PageTitle title="Dashboard" />
      </Stack>
      <Stack width="100%" justifyContent="center" alignItems="center">
        <Box
          component="img"
          alt="Dash"
          src="/assets/Site_Stats.gif"
          borderRadius={2}
          sx={{
            display: "inline-block",
            height: "auto",
            maxWidth: "100%",
            width: "600px",
            opacity: 0.4,
          }}
        />
      </Stack>
    </Stack>
  );
};

export default Page;

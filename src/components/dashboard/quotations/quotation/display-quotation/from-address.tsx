import { CompanyDto } from "@/types/company.types";
import { formatDisplayedPhoneNumber } from "@/utils/formatters.util";
import { Stack, Typography } from "@mui/material";

type Props = {
  company: CompanyDto;
};

const FromAddress = ({ company }: Props) => {
  return (
    <Stack flex={1} spacing={1}>
      <Typography variant="body1" fontWeight={600}>
        From
      </Typography>
      <Typography variant="body1">
        {company.legal_name ? company.legal_name : company.business_name}
      </Typography>
      <Typography variant="body1">
        {company.address.box_number &&
          `P. O. Box ${company.address.box_number},`}{" "}
        {company.address.district}, {company.address.country}
      </Typography>
      <Typography variant="body1">
        {company.address.plot_number && `Plot ${company.address.plot_number},`}{" "}
        {company.address.street && company.address.street}
      </Typography>
      <Typography variant="body1">{company.email}</Typography>
      <Typography variant="body1">
        {formatDisplayedPhoneNumber(company.phone_number_1)}
      </Typography>
    </Stack>
  );
};

export default FromAddress;

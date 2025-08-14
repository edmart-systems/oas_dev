import { Chip, Tooltip } from "@mui/material";
import React, { ReactElement } from "react";
import {
  CheckCircle,
  RemoveCircle,
  QueryBuilder,
  HighlightOff,
  AutoAwesome,
} from "@mui/icons-material";
import { capitalizeFirstLetter } from "@/utils/formatters.util";
import { QuotationStatusKey } from "@/types/quotations.types";
import { MUIColor, MUIColorWithDefault } from "@/types/other.types";

const statusConfig: {
  [key in QuotationStatusKey]: {
    icon: ReactElement;
    color: MUIColorWithDefault;
  };
} = {
  created: {
    icon: <AutoAwesome />,
    color: "default",
  },
  sent: {
    icon: <QueryBuilder />,
    color: "secondary",
  },
  accepted: {
    icon: <CheckCircle />,
    color: "success",
  },
  expired: {
    icon: <RemoveCircle />,
    color: "error",
  },
  rejected: {
    icon: <HighlightOff />,
    color: "warning",
  },
};

type Props = {
  status: QuotationStatusKey;
};

const QuotationStatusChip = ({ status }: Props) => {
  const statusName = capitalizeFirstLetter(status);
  const config = statusConfig[status];

  return (
    <Tooltip title={"Description"}>
      <Chip
        color={config.color}
        icon={config.icon}
        label={statusName}
        variant="outlined"
        size="small"
      />
    </Tooltip>
  );
};

export default QuotationStatusChip;

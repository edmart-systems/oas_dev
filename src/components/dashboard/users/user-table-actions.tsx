import React, { FormEvent } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CaretDoubleDown,
  CaretDown,
  CheckCircle,
  StopCircle,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import { PopupState as PopupStateHook } from "material-ui-popup-state/hooks";
import { toast } from "react-toastify";

const MyMenuItem = styled("div")({
  padding: "6px 16px",
  width: "200px",
});

type Props = {};

const UserTableActions = () => {
  const handleAction = (action: string, popupState: PopupStateHook) => {
    toast("Action not supported yet", {
      type: "info",
    });
    popupState.close();
  };
  return (
    <PopupState variant="popover" popupId="actions-popup-menu">
      {(popupState) => (
        <React.Fragment>
          <Button
            variant="outlined"
            color="primary"
            endIcon={<CaretDown />}
            {...bindTrigger(popupState)}
          >
            Actions
          </Button>
          <Menu {...bindMenu(popupState)}>
            <MyMenuItem>
              <Typography>Select an action</Typography>
            </MyMenuItem>
            <MyMenuItem>
              <Button
                variant="contained"
                color="success"
                endIcon={<CheckCircle />}
                onClick={() => handleAction("activate", popupState)}
                fullWidth
              >
                Activate
              </Button>
            </MyMenuItem>
            <MyMenuItem>
              <Button
                variant="contained"
                color="warning"
                endIcon={<StopCircle />}
                onClick={() => handleAction("Block", popupState)}
                fullWidth
              >
                Block
              </Button>
            </MyMenuItem>
            <MyMenuItem>
              <Button
                variant="contained"
                color="error"
                endIcon={<Trash />}
                onClick={() => handleAction("Delete", popupState)}
                fullWidth
              >
                Delete
              </Button>
            </MyMenuItem>
          </Menu>
        </React.Fragment>
      )}
    </PopupState>
  );
};

export default UserTableActions;

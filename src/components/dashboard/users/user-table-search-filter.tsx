import React, { FormEvent, useRef } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { TextField, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { PlusCircle } from "@phosphor-icons/react/dist/ssr";
import { PopupState as PopupStateHook } from "material-ui-popup-state/hooks";

const MyMenuItem = styled("div")({
  padding: "6px 16px",
});

type Props = {
  name: string;
};

const UserTableSearchFilter = ({ name }: Props) => {
  const textRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (evt: FormEvent, popupState: PopupStateHook) => {
    evt.preventDefault();
    const txtValue = textRef.current?.value;
    popupState.close();
  };
  return (
    <PopupState
      variant="popover"
      popupId={`${name.replace(/ /g, "-")}-popup-menu`}
    >
      {(popupState) => (
        <React.Fragment>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<PlusCircle />}
            {...bindTrigger(popupState)}
          >
            {name}
          </Button>
          <Menu {...bindMenu(popupState)}>
            <form onSubmit={(evt) => handleSubmit(evt, popupState)}>
              <MyMenuItem>
                <Typography>Filter by {name}</Typography>
              </MyMenuItem>
              <MyMenuItem>
                <TextField size="small" inputRef={textRef} />
              </MyMenuItem>
              <MyMenuItem>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  color="primary"
                >
                  Apply
                </Button>
              </MyMenuItem>
            </form>
          </Menu>
        </React.Fragment>
      )}
    </PopupState>
  );
};

export default UserTableSearchFilter;

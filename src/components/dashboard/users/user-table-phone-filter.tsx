import React, { FormEvent, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { TextField, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { PlusCircle } from "@phosphor-icons/react/dist/ssr";
import { PopupState as PopupStateHook } from "material-ui-popup-state/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { paths } from "@/utils/paths.utils";
import nProgress from "nprogress";

const MyMenuItem = styled("div")({
  padding: "6px 16px",
});

const UserTablePhoneFilter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentValue = searchParams.get("phone");
  const [txtInput, setTxtInput] = useState<string>(currentValue ?? "");

  const handleSubmit = (evt: FormEvent, popupState: PopupStateHook) => {
    evt.preventDefault();
    if (txtInput) {
      setSearchParams(txtInput);
    }
    popupState.close();
    // setTxtInput("");
  };

  const setSearchParams = (searchName: string) => {
    const currentParams = new URLSearchParams(searchParams as any);
    if (currentParams.has("phone")) {
      currentParams.delete("phone");
      currentParams.append("phone", searchName);
    } else {
      currentParams.append("phone", searchName);
    }
    nProgress.start();
    router.push(`${paths.dashboard.users.main}?${currentParams.toString()}`);
  };

  const clearHandler = (popupState: PopupStateHook) => {
    const currentParams = new URLSearchParams(searchParams as any);
    currentParams.delete("phone");
    nProgress.start();
    router.push(`${paths.dashboard.users.main}?${currentParams.toString()}`);
    setTxtInput("");
    popupState.close();
  };

  return (
    <PopupState variant="popover" popupId={`user-phone-popup-menu`}>
      {(popupState) => (
        <React.Fragment>
          <Button
            variant="contained"
            color={currentValue ? "success" : "inherit"}
            startIcon={<PlusCircle />}
            {...bindTrigger(popupState)}
          >
            Phone Number
          </Button>
          <Menu {...bindMenu(popupState)}>
            <form onSubmit={(evt) => handleSubmit(evt, popupState)}>
              <MyMenuItem>
                <Typography>Filter by Phone Number</Typography>
              </MyMenuItem>
              <MyMenuItem>
                <TextField
                  size="small"
                  onChange={(evt) => setTxtInput(evt.target.value)}
                  value={txtInput}
                />
              </MyMenuItem>
              {currentValue && (
                <MyMenuItem>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="success"
                    onClick={() => clearHandler(popupState)}
                  >
                    Clear
                  </Button>
                </MyMenuItem>
              )}
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

export default UserTablePhoneFilter;

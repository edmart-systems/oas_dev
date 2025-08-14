"use client";

import React, {
  Dispatch,
  forwardRef,
  Fragment,
  Ref,
  SetStateAction,
  useState,
} from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { UserRoleDto, UserRoleKey } from "@/types/user.types";
import { capitalizeFirstLetter } from "@/utils/formatters.util";
import SimpleConfirmDialog from "@/components/dashboard/common/simple-confirm-dialog";
import nProgress from "nprogress";
import { useRouter } from "next/navigation";
import { ActionResponse } from "@/types/actions-response.types";
import { toast } from "react-toastify";
import LoadingBackdrop from "@/components/common/loading-backdrop";
import { updateUserRole } from "@/server-actions/user-actions/user.actions";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  userRole: UserRoleDto;
  userRoles: UserRoleDto[];
  userId: string;
  userName: string;
};

const SelectRoleDialog = ({
  isOpen,
  setIsOpen,
  userRole,
  userRoles,
  userId,
  userName,
}: Props) => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRoleKey | "">("");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);

  const closeHandler = () => {
    if (isFetching) return;
    setSelectedRole("");
    setOpenConfirm(false);
    setIsFetching(false);
    setIsOpen(false);
  };

  const openConfirmHandler = () => {
    if (isFetching) return;
    setOpenConfirm(true);
  };

  const submitNewRoleHandler = async () => {
    if (isFetching || !selectedRole) return;

    setIsFetching(true);
    const res: ActionResponse = await updateUserRole(userId, selectedRole);

    if (!res.status) {
      toast("Failed to update status.", {
        type: "error",
      });
      toast(res.message, {
        type: "error",
      });
      console.log(res.message);
      setIsFetching(false);
      return;
    }

    setIsFetching(false);
    closeHandler();
    nProgress.start();
    router.refresh();
    return;
  };

  return (
    <Fragment>
      <Dialog
        maxWidth="sm"
        fullWidth={true}
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={closeHandler}
        aria-describedby="date-picker-dialog-slide"
      >
        <DialogTitle>Select A New Role</DialogTitle>
        <DialogContent>
          <Stack padding={2}>
            <FormControl fullWidth>
              <InputLabel id="role-simple-select-label">Role</InputLabel>
              <Select
                labelId="role-simple-select-label"
                id="role-select"
                value={selectedRole}
                label="Role"
                onChange={(evt) =>
                  setSelectedRole(evt.target.value as UserRoleKey)
                }
                disabled={isFetching}
                // size="small"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {userRoles.map((item, index) => {
                  return (
                    <MenuItem
                      key={item.role}
                      value={item.role}
                      disabled={item.role === userRole.role}
                    >
                      {capitalizeFirstLetter(item.role)}&ensp;
                      {item.role_desc &&
                        `(${item.role_desc.substring(0, 120)})`}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeHandler}
            disabled={isFetching}
            variant="outlined"
            color="error"
          >
            Cancel
          </Button>
          <Button
            onClick={() => openConfirmHandler()}
            variant="contained"
            color="primary"
            disabled={
              !selectedRole || selectedRole === userRole.role || isFetching
            }
          >
            Submit
          </Button>
        </DialogActions>
        <LoadingBackdrop open={isFetching} />
      </Dialog>
      {openConfirm && (
        <SimpleConfirmDialog
          isOpen={openConfirm}
          setIsOpen={setOpenConfirm}
          confirmHandler={submitNewRoleHandler}
          title={`Confirm Updating ${userName}'s User Role.`}
          body={`Are you sure you want to change the role of user ${userId} (${userName}) to ${capitalizeFirstLetter(
            selectedRole
          )}?`}
        />
      )}
    </Fragment>
  );
};

export default SelectRoleDialog;

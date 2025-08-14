import React, { forwardRef, Fragment, Ref } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { FullUser, UserStatusActionType } from "@/types/user.types";
import { PopupState as PopupStateHook } from "material-ui-popup-state/hooks";
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { User } from "@phosphor-icons/react/dist/ssr";
import UserInfoCardItem from "./user-info-card-item";
import {
  capitalizeFirstLetter,
  formatDisplayedPhoneNumber,
  userNameFormatter,
} from "@/utils/formatters.util";
import UserStatusChip from "./user-status-chip";
import VerifiedChip from "./verified-chip";
import { fDateTime12, fToNow } from "@/utils/time.utils";
import { sxFlexRowSpaceBtn } from "@/utils/styles.utils";
import { useSession } from "next-auth/react";
import { MyCardContent } from "./user-basic-info-card";

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
  action: UserStatusActionType;
  closeHandler: () => void;
  submitHandler: (popupState: PopupStateHook) => void;
  isFetching: boolean;
  user: FullUser;
  popupState: PopupStateHook;
};

type ConfigType = {
  [key in UserStatusActionType]: {
    bodyTxt: string;
    buttonTxt: string;
  };
};

const config: ConfigType = {
  activate: {
    bodyTxt: "activate user?",
    buttonTxt: "Activate",
  },
  block: {
    bodyTxt: "block user?",
    buttonTxt: "Block",
  },
  delete: {
    bodyTxt: "delete user?",
    buttonTxt: "Delete",
  },
  setLeft: {
    bodyTxt: "set user as left?",
    buttonTxt: "Set As Left",
  },
};

const ConfirmUserStatusDialog = ({
  action,
  isOpen,
  closeHandler,
  submitHandler,
  isFetching,
  user,
  popupState,
}: Props) => {
  return (
    <Fragment>
      <Dialog
        maxWidth="md"
        fullWidth={true}
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={closeHandler}
        aria-describedby="status-confirm-dialog-slide"
      >
        <DialogTitle>Confirm Updating User Account Status</DialogTitle>
        <DialogContent>
          <DialogContentText id="status-confirm-dialog-slide">
            {"Are you sure you want to " + config[action].bodyTxt}
          </DialogContentText>
          <br />
          <UserBasicInfoCard user={user} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeHandler}
            variant="outlined"
            disabled={isFetching}
            color="error"
          >
            Cancel
          </Button>
          <Button
            onClick={() => submitHandler(popupState)}
            disabled={isFetching}
            variant="contained"
            color="primary"
          >
            {config[action].buttonTxt}
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

const UserBasicInfoCard = ({ user }: { user: FullUser }) => {
  const { data: sessionData } = useSession();

  const isYou = sessionData
    ? sessionData.user.co_user_id === user.co_user_id
    : false;

  return (
    <Card>
      <CardContent>
        <Stack direction="row" gap={2} alignItems="center">
          <Avatar>
            <User size={28} />
          </Avatar>
          <Typography variant="h6">Basic Details</Typography>
        </Stack>
      </CardContent>
      <MyCardContent>
        <UserInfoCardItem title="User Id" content={user.co_user_id} />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="Name"
          content={
            userNameFormatter(user.firstName, user.lastName, user.otherName) +
            (isYou ? " (You)" : "")
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="NIN"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {"Not Available"}
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem title="Date Of Birth" content={"Not Available"} />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="Role"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {capitalizeFirstLetter(user.role.role)}
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="Email"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {user.email}&ensp;
              <VerifiedChip isVerified={user.email_verified === 1} />
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="Phone"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {formatDisplayedPhoneNumber(user.phone_number)}&ensp;
              <VerifiedChip isVerified={user.phone_verified === 1} />
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="Account Status"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {capitalizeFirstLetter(user.status.status)}&ensp;
              <UserStatusChip status={user.status} />
            </Typography>
          }
        />
      </MyCardContent>
      <Divider />
      <MyCardContent>
        <UserInfoCardItem
          title="Created At"
          content={
            <Typography
              variant="body1"
              fontWeight={600}
              letterSpacing={1}
              display="flex"
              alignItems="center"
              sx={sxFlexRowSpaceBtn}
            >
              {fDateTime12(user.created_at)}&ensp;
              <Chip
                variant="outlined"
                label={capitalizeFirstLetter(fToNow(user.created_at))}
                size="small"
                color="default"
                sx={{ cursor: "pointer" }}
              />
            </Typography>
          }
        />
      </MyCardContent>
    </Card>
  );
};

export default ConfirmUserStatusDialog;

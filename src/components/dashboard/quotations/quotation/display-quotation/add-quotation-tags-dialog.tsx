import React, {
  Dispatch,
  forwardRef,
  Fragment,
  Ref,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Theme,
  useTheme,
} from "@mui/material";
import { getDateStrYyMmDd } from "@/utils/time.utils";
import { QuotationId, QuotationTaggedUser } from "@/types/quotations.types";
import { SummarizedUser } from "@/types/user.types";
import { fetchSummarizedUsersAction } from "@/server-actions/user-actions/user.actions";
import { ActionResponse } from "@/types/actions-response.types";
import { toast } from "react-toastify";
import { userNameFormatter } from "@/utils/formatters.util";
import { tagUserOnQuotation } from "@/server-actions/quotations-actions/quotations.actions";
import { MAX_TAG_MESSAGE_LENGTH } from "@/utils/constants.utils";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const getStyles = (
  name: string,
  selectedUsersStrArr: readonly string[],
  theme: Theme
) => {
  return {
    fontWeight: selectedUsersStrArr.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
};

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setQuotationTags: Dispatch<SetStateAction<QuotationTaggedUser[] | null>>;
  existingTags: QuotationTaggedUser[];
  creator: SummarizedUser;
  isVariant: boolean;
  quotationId: QuotationId;
};

const AddQuotationTagsDialog = ({
  isOpen,
  setIsOpen,
  setQuotationTags,
  existingTags,
  creator,
  isVariant,
  quotationId,
}: Props) => {
  const theme = useTheme();
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [users, setUsers] = useState<SummarizedUser[]>([]);
  const [selectedUsersStr, setSelectedUsersStr] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

  const resetInitiallySelected = (
    otherExistingTags: QuotationTaggedUser[] = existingTags
  ) => {
    const initiallySelected: string[] = [];
    for (const user of [creator, ...otherExistingTags]) {
      initiallySelected.push(
        userNameFormatter(user.firstName, user.lastName, user.otherName)
      );
    }
    setSelectedUsersStr(initiallySelected);
  };

  const fetchUsers = async () => {
    try {
      if (isFetching) return;
      setIsFetching(true);
      const res: ActionResponse<SummarizedUser[]> =
        await fetchSummarizedUsersAction();

      if (!res.status || !res.data) {
        toast(res.message, { type: "error" });
        return;
      }

      setUsers(res.data);
      resetInitiallySelected();
    } catch (err) {
      console.log(err);
      toast("An error occurred", { type: "error" });
    } finally {
      setIsFetching(false);
    }
  };

  const tagUsersToQuotation = async () => {
    try {
      if (isFetching) return;
      setIsFetching(true);
      const newTagUsers = users.filter(
        (user) =>
          selectedUsersStr.some(
            (selected) =>
              userNameFormatter(
                user.firstName,
                user.lastName,
                user.otherName
              ) === selected
          ) &&
          !existingTags.some((tag) => tag.co_user_id === user.co_user_id) &&
          user.co_user_id !== creator.co_user_id
      );

      if (newTagUsers.length < 1) {
        toast("No new selected users", { type: "info" });
        setIsFetching(false);
        return;
      }

      const res: ActionResponse<QuotationTaggedUser[]> =
        await tagUserOnQuotation(
          newTagUsers,
          quotationId,
          isVariant,
          message ?? null
        );

      if (!res.status || !res.data) {
        toast(res.message, { type: "error" });
        setIsFetching(false);
        return;
      }

      setQuotationTags(res.data);
      resetInitiallySelected(res.data);
      // console.log(res.message);
      toast("User(s) tagged successfully", { type: "success" });
      setIsFetching(false);
      closeHandler();
    } catch (err) {
      console.log(err);
      toast("An error occurred", { type: "error" });
      setIsFetching(false);
      closeHandler();
    }
  };

  const handleChange = (evt: SelectChangeEvent<typeof selectedUsersStr>) => {
    const {
      target: { value },
    } = evt;

    setSelectedUsersStr(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const closeHandler = () => {
    if (isFetching) return;
    setMessage("");
    setIsOpen(false);
  };

  useEffect(() => {
    if (users.length === 0) {
      fetchUsers();
    }
  }, []);

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
        <DialogTitle>Tag users to your quotation</DialogTitle>
        <DialogContent>
          <Stack padding={2} spacing={2}>
            <FormControl disabled={isFetching} sx={{ width: "100%" }}>
              <InputLabel id="demo-multiple-chip-label" size="small">
                Users
              </InputLabel>
              <Select
                labelId="users-multiple-chip-label"
                id="user-multiple-chip"
                multiple
                size="small"
                fullWidth={true}
                value={selectedUsersStr}
                onChange={handleChange}
                disabled={isFetching}
                input={
                  <OutlinedInput id="user-select-multiple-chip" label="Users" />
                }
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const isExisting = [creator, ...existingTags].some(
                        (item) =>
                          value ===
                          userNameFormatter(
                            item.firstName,
                            item.lastName,
                            item.otherName
                          )
                      );
                      return (
                        <Chip
                          key={value}
                          label={value}
                          size="small"
                          variant={isExisting ? "filled" : "outlined"}
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {users.map((user, index) => {
                  const name = userNameFormatter(
                    user.firstName,
                    user.lastName,
                    user.otherName
                  );
                  const isDisabled =
                    user.co_user_id === creator.co_user_id ||
                    existingTags.some(
                      (item) => item.co_user_id === user.co_user_id
                    );
                  return (
                    <MenuItem
                      key={index}
                      value={name}
                      style={getStyles(name, selectedUsersStr, theme)}
                      disabled={isDisabled}
                    >
                      {name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <TextField
              label="Message (Optional)"
              variant="outlined"
              value={message}
              onChange={(evt) => setMessage(evt.target.value)}
              fullWidth
              multiline
              minRows={2}
              maxRows={6}
              slotProps={{ htmlInput: { maxLength: MAX_TAG_MESSAGE_LENGTH } }}
              helperText={
                message && message.length > 250
                  ? `  Remaining ${
                      MAX_TAG_MESSAGE_LENGTH - message.length
                    } characters`
                  : undefined
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHandler} variant="outlined" color="error">
            Cancel
          </Button>
          <Button
            onClick={() => tagUsersToQuotation()}
            variant="contained"
            color="primary"
          >
            Tag
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default AddQuotationTagsDialog;

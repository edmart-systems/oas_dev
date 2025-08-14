import React, {
  Dispatch,
  forwardRef,
  Fragment,
  Ref,
  SetStateAction,
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
import { Stack } from "@mui/material";
import { getDateStrYyMmDd } from "@/utils/time.utils";

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
  setSelectedDate: Dispatch<SetStateAction<string>>;
  selectedDate: string;
};

const SelectDateDialog = ({
  isOpen,
  setIsOpen,
  setSelectedDate,
  selectedDate,
}: Props) => {
  const closeHandler = () => {
    setIsOpen(false);
  };

  const setDate = (dayJsObj: Dayjs | null) => {
    try {
      if (!dayJsObj) return;

      // const mm = dayJsObj.month();
      // const dd = dayJsObj.date();
      // const yy = dayJsObj.year();

      // if (isNaN(mm) || isNaN(dd) || isNaN(yy)) {
      //   throw new Error("Invalid date selection");
      // }

      // const dateStr = `${yy}-${mm + 1}-${dd}`;

      setSelectedDate(getDateStrYyMmDd(dayJsObj.toDate()));
      closeHandler();
    } catch (err) {
      console.log(err);
    }
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
        <DialogTitle>Select A Date</DialogTitle>
        <DialogContent>
          <Stack padding={2}>
            <DatePicker
              label="Issue Date"
              // disableFuture
              value={dayjs(selectedDate)}
              onChange={(date) => setDate(date)}
              sx={{ width: "100%" }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHandler} variant="outlined" color="error">
            Cancel
          </Button>
          <Button onClick={closeHandler} variant="contained" color="primary">
            Set
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default SelectDateDialog;

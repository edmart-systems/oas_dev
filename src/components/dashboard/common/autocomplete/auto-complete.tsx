"use client";
import { PRIMARY_COLOR } from "@/utils/constants.utils";
import {
  Card,
  ClickAwayListener,
  List,
  ListItem,
  ListItemButton,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { debounce } from "lodash";
import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";

type Props = {
  fieldProps?: TextFieldProps;
  dataKey?: string;
  //   isObject: boolean;
  staticData: string[];
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  allowOther?: boolean;
  wrapOptions?: boolean;
  initValue?: string;
};

const AutoComplete = ({
  fieldProps,
  staticData,
  selectedOption,
  setSelectedOption,
  allowOther = false,
  wrapOptions = false,
  initValue = "",
}: //   dataKey,
//   isObject = false,
Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>(initValue);
  const [suggestions, setSuggestions] = useState<string[]>(staticData);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const inputChangeHandler = (evt: ChangeEvent<HTMLInputElement>) => {
    setUserInput(evt.target.value);
    if (selectedOption) setSelectedOption("");
    if (!isOpen) handleOpen();
  };

  const getSuggestions = (query: string) => {
    if (!query || query.length < 1) return;
    setIsBusy(true);
    const filtered = staticData.filter((item) => {
      try {
        // if (isObject) {
        //   if (!dataKey) return false;
        //   return (item[dataKey] as string)
        //     .toLowerCase()
        //     .includes(query.toLowerCase());
        // }

        return item.toLowerCase().includes(query.toLowerCase());
      } catch (err) {
        console.log(err);
        return false;
      }
    });

    setSuggestions(filtered);
    setIsBusy(false);
  };

  const getSuggestionsDebounced = debounce(getSuggestions, 300);

  //   useEffect(() => {
  //     if (selectedOption !== userInput) {
  //       setUserInput(selectedOption);
  //     }
  //   }, [selectedOption]);

  useEffect(() => {
    if (!userInput || userInput.length < 1) {
      setSuggestions(staticData);
      return;
    }
    getSuggestionsDebounced(userInput);
  }, [userInput]);

  const optionClickHandler = (option: string) => {
    setUserInput(option);
    setSelectedOption(option);
    handleClose();
  };

  const selectOtherHandler = () => {
    if (!allowOther) return;
    setSelectedOption(userInput);
    handleClose();
  };

  const generateOptionDisplayTxt = (option: string, query: string) => {
    const strArr = option.split(new RegExp(`(${query})`, "gi"));
    return (
      <Typography variant="body1" noWrap={!wrapOptions}>
        {strArr.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span style={{ color: PRIMARY_COLOR }} key={index}>
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </Typography>
    );
  };

  const handleClickAway = () => {
    if (userInput !== selectedOption) {
      setUserInput("");
      setSelectedOption("");
    }
    handleClose();
  };

  const textFieldKeyHandler = (evt: KeyboardEvent<HTMLDivElement>) => {
    if (evt.key === "Escape") {
      return handleClickAway();
    } else if (evt.key === "Enter") {
      if (suggestions.length > 0) {
        return optionClickHandler(suggestions[0]);
      }
      setUserInput("");
      setSelectedOption("");
      return handleClickAway();
    } else if (evt.key === "ArrowDown") {
      return;
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div style={{ width: "100%", position: "relative" }}>
        <TextField
          {...fieldProps}
          value={userInput}
          onChange={inputChangeHandler}
          // onFocus={handleOpen}
          onClick={handleOpen}
          autoComplete="null"
          onKeyDown={textFieldKeyHandler}
        />
        {isOpen && (
          <Card
            sx={{
              position: "absolute",
              minWidth: "100%",
              zIndex: 5,
              borderRadius: "5px",
              borderTopRightRadius: "0px",
              borderTopLeftRadius: "0px",
              borderTop: "none",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            <List dense>
              {suggestions.length > 0 ? (
                suggestions.map((item, index) => {
                  return (
                    <ListItem
                      key={index}
                      onClick={() => optionClickHandler(item)}
                      disablePadding
                    >
                      <ListItemButton>
                        {generateOptionDisplayTxt(item, userInput)}
                      </ListItemButton>
                    </ListItem>
                  );
                })
              ) : (
                <ListItem key={"998"} disablePadding>
                  <ListItemButton disabled>
                    <Typography
                      variant="body2"
                      align="center"
                      noWrap={!wrapOptions}
                    >
                      No Items Found
                    </Typography>
                  </ListItemButton>
                </ListItem>
              )}

              {allowOther &&
                suggestions.length < 1 &&
                userInput.length > 0 &&
                selectedOption.length < 1 && (
                  <ListItem
                    key={"999"}
                    onClick={selectOtherHandler}
                    disablePadding
                  >
                    <ListItemButton>
                      <Typography
                        variant="body2"
                        align="center"
                        noWrap={!wrapOptions}
                      >
                        Consider as Other
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                )}
            </List>
          </Card>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default AutoComplete;

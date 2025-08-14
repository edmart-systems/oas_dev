"use client";

import React from "react";
import Avatar from "@mui/material/Avatar";

const stringToColor = (string: string) => {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};

export const stringAvatar = (name: string, size?: number) => {
  const nameArr = name.split(" ");
  return {
    sx: {
      bgcolor: stringToColor(name),
      cursor: "pointer",
      ...(size ? { width: size, height: size } : {}),
    },
    children: `${nameArr[0][0] ?? "X"}${nameArr[1][0] ?? "X"}`,
  };
};

type Props = {
  userName?: string;
  ref?: any;
  clickHandler?: () => void;
  src?: string | null;
  size?: number;
};

const UserAvatar = ({ userName, clickHandler, ref, src, size }: Props) => {
  return (
    <Avatar
      {...stringAvatar(userName ? userName : "NA AN", size)}
      onClick={clickHandler}
      ref={ref}
      src={src ?? ""}
    />
  );
};

export default UserAvatar;

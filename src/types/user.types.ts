// src/types/user.types.ts

import { Role, Status, User, User_signature } from "@prisma/client";
import { ReactElement } from "react";
import { Dimensions } from "./other.types";
import { NotificationsCount } from "./notification.types";

export type SimpleUserDtoType = {
  firstName: string;
  lastName: string;
  email: string;
  userId: number;
  co_user_id: string;
  otherName: string | null;
  phone_number: string;
  profile_picture: string | null;
  status_id: number;
  role_id: number;
};

// export type NewUser = {
//   co_user_id: string;
//   firstName: string;
//   lastName: string;
//   otherName: string;
//   email: string;
//   phone_number: string;
//   role_id: number;
//   status_id: number;
//   hash: string;
//   profile_picture?: string;
// };

export type NewUser = Omit<User, "userId" | "created_at" | "updated_at">;

export type UserRegInfo = {
  firstName?: string;
  lastName?: string;
  otherName?: string;
  email?: string;
  phone?: string;
  tcsAgreement?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  verifiedEmail?: string;
  verifiedPhone?: string;
};

export type UserRegPass = {
  pass1: string;
  pass2: string;
};

export type UserStatus = "active" | "blocked" | "pending" | "inactive";

export type UserStatusDto = Pick<Status, "status" | "status_id">;

export type UserRoleDto = Omit<Role, "created_at" | "updated_at">;

export type FullUser = Omit<User, "hash"> & {
  role: UserRoleDto;
  status: Omit<Status, "created_at" | "updated_at">;
};

export type UserStatusCounts = {
  [key in UserStatus | "all"]: number;
};

export type UsersAndStatusCounts = {
  users: FullUser[];
  summary: UserStatusCounts;
};

export type UserStatusActionType = "block" | "delete" | "setLeft" | "activate";

export type UserStatusAction = {
  [key in UserStatus]: {
    name: UserStatusActionType;
    label: string;
    desc: string;
    color:
      | "error"
      | "info"
      | "success"
      | "warning"
      | "primary"
      | "inherit"
      | "secondary"
      | undefined;
    icon: ReactElement;
  }[];
};

export type PendingUserActivationData = {
  old_co_user_id: string;
  co_user_id: string;
};

export type UserSignatureDto = Omit<
  User_signature,
  "created_at" | "updated_at"
>;

export type NewSignatureData = {
  userId: string;
  dataUrl: string;
};

export type UserRoleKey = "manager" | "employee";

export type SingleUserPageData = {
  user: FullUser;
  userRoles: UserRoleDto[];
};

export type SummarizedUser = {
  firstName: string;
  lastName: string;
  otherName?: string | null;
  co_user_id: string;
};

export type SignatureDimensions = {
  userId: string;
  dimensions: Dimensions;
};

export type HeartbeatResponseData = {
  status: UserStatusDto;
  notificationsCounts?: NotificationsCount;
};

export type NewPasswordReset = {
  userId: number;
  token: string;
  expires_at: Date;
};
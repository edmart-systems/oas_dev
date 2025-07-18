export type ItemRange = {
  min: number;
  max: number;
};

export type ObjectVerifyResponse = {
  valid: boolean;
  errors?: string[];
};

export type PaginationData = {
  total: number;
  min: number;
  max: number;
  BoL: boolean;
  EoL: boolean;
};

export type MUIColor =
  | "error"
  | "info"
  | "success"
  | "warning"
  | "primary"
  | "secondary"
  | undefined;

export type MUIColorWithInherit = MUIColor | "inherit";

export type MUIColorWithDefault = MUIColor | "default";

export type Dimensions = {
  height: number;
  width: number;
};

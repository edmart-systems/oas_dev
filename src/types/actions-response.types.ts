export type ActionResponse<T = any> = {
  status: boolean;
  message: string;
  data?: T;
};

export const isActionResponse = (obj: any): obj is ActionResponse => {
  return (
    typeof obj === "object" &&
    "status" in obj &&
    "message" in obj &&
    "data" in obj &&
    "data" in obj
  );
};

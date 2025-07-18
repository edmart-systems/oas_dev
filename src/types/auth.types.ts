export type LoginCredentials =
  | {
      email: string;
      phone?: never;
      password: string;
    }
  | {
      phone: string;
      email?: never;
      password: string;
    };

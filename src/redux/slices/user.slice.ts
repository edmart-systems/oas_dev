import { SessionUser } from "@/server-actions/auth-actions/auth.actions";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  user: SessionUser | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<SessionUser>) => {
      state.user = action.payload;
    },
    resetUser: (state) => {
      state.user = null;
    },
  },
});

export const { updateUser, resetUser } = userSlice.actions;
export const userReducer = userSlice.reducer;

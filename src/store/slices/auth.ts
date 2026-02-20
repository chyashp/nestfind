import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserRole } from "@/types/database";

interface AuthState {
  userId: string | null;
  role: UserRole | null;
  fullName: string | null;
  avatarUrl: string | null;
  email: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  userId: null,
  role: null,
  fullName: null,
  avatarUrl: null,
  email: null,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(
      state,
      action: PayloadAction<{
        userId: string;
        role: UserRole;
        fullName: string;
        avatarUrl: string | null;
        email: string;
      }>
    ) {
      state.userId = action.payload.userId;
      state.role = action.payload.role;
      state.fullName = action.payload.fullName;
      state.avatarUrl = action.payload.avatarUrl;
      state.email = action.payload.email;
      state.isLoading = false;
    },
    clearUser(state) {
      state.userId = null;
      state.role = null;
      state.fullName = null;
      state.avatarUrl = null;
      state.email = null;
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    updateAvatar(state, action: PayloadAction<string>) {
      state.avatarUrl = action.payload;
    },
    updateName(state, action: PayloadAction<string>) {
      state.fullName = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading, updateAvatar, updateName } =
  authSlice.actions;
export default authSlice.reducer;

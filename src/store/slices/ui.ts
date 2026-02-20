import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type ViewMode = "grid" | "list";

interface UiState {
  sidebarOpen: boolean;
  activeModal: string | null;
  viewMode: ViewMode;
  theme: "light" | "dark";
}

const initialState: UiState = {
  sidebarOpen: true,
  activeModal: null,
  viewMode: "grid",
  theme: "light",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    setViewMode(state, action: PayloadAction<ViewMode>) {
      state.viewMode = action.payload;
    },
    setTheme(state, action: PayloadAction<"light" | "dark">) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  setViewMode,
  setTheme,
  toggleTheme,
} = uiSlice.actions;
export default uiSlice.reducer;

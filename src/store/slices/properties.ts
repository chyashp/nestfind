import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Property } from "@/types/database";

interface PropertiesState {
  selectedProperty: Property | null;
  savedIds: string[];
}

const initialState: PropertiesState = {
  selectedProperty: null,
  savedIds: [],
};

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    setSelectedProperty(state, action: PayloadAction<Property | null>) {
      state.selectedProperty = action.payload;
    },
    setSavedIds(state, action: PayloadAction<string[]>) {
      state.savedIds = action.payload;
    },
    toggleSaved(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.savedIds.includes(id)) {
        state.savedIds = state.savedIds.filter((s) => s !== id);
      } else {
        state.savedIds.push(id);
      }
    },
  },
});

export const { setSelectedProperty, setSavedIds, toggleSaved } =
  propertiesSlice.actions;
export default propertiesSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Property, SearchFilters } from "@/types/database";

interface SearchState {
  filters: SearchFilters;
  results: Property[];
  total: number;
  isLoading: boolean;
  mapBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null;
}

const initialState: SearchState = {
  filters: {
    listing_type: undefined,
    property_type: undefined,
    sort: "newest",
    page: 1,
    limit: 12,
  },
  results: [],
  total: 0,
  isLoading: false,
  mapBounds: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<SearchFilters>>) {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload;
    },
    setResults(
      state,
      action: PayloadAction<{ data: Property[]; total: number }>
    ) {
      state.results = action.payload.data;
      state.total = action.payload.total;
      state.isLoading = false;
    },
    setSearchLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setMapBounds(
      state,
      action: PayloadAction<SearchState["mapBounds"]>
    ) {
      state.mapBounds = action.payload;
    },
    resetFilters(state) {
      state.filters = { ...initialState.filters };
      state.results = [];
      state.total = 0;
    },
  },
});

export const {
  setFilters,
  setPage,
  setResults,
  setSearchLoading,
  setMapBounds,
  resetFilters,
} = searchSlice.actions;
export default searchSlice.reducer;

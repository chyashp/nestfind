import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth";
import uiReducer from "./slices/ui";
import searchReducer from "./slices/search";
import propertiesReducer from "./slices/properties";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    search: searchReducer,
    properties: propertiesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

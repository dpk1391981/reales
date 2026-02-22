import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import masterReducer from "./slices/masterSlice";
import locationReducer from "./slices/locationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    masters: masterReducer,
    location: locationReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
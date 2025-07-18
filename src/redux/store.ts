import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";

import { PersistConfig, persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { themeReducer } from "./slices/theme.slice";
import { appReducer } from "./slices/app.slice";
import { notificationsReducer } from "./slices/notifications.slice";
import { unitsReducer } from "./slices/units.slice";
import { currenciesReducer } from "./slices/currencies.slice";
import { quotationsReducer } from "./slices/quotation.slice";
import { quotationSearchReducer } from "./slices/quotation-search.slice";
import { userReducer } from "./slices/user.slice";
import { activityReducer } from "./slices/activity.slice";

const createNoopStorage = () => {
  return {
    getItem(_key: any) {
      return Promise.resolve(null);
    },
    setItem(_key: any, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: any) {
      return Promise.resolve();
    },
  };
};

const fixedStorage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const themePersistConfig = {
  key: "theme",
  storage: fixedStorage,
};

const appSlicePersistConfig = {
  key: "app",
  storage: fixedStorage,
};

const notificationsSlicePersistConfig = {
  key: "notifications",
  storage: fixedStorage,
};

const unitsPersistConfig = {
  key: "units",
  storage: fixedStorage,
};

const currenciesPersistConfig = {
  key: "currencies",
  storage: fixedStorage,
};

const quotationsPersistConfig = {
  key: "quotations",
  storage: fixedStorage,
  blacklist: ["reuse"],
};

const quotationSearchPersistConfig = {
  key: "quotationSearch",
  storage: fixedStorage,
  blacklist: ["params"],
};

const userPersistConfig = {
  key: "user",
  storage: fixedStorage,
};

const activityPersistConfig = {
  key: "activity",
  storage: fixedStorage,
};

const rootReducer = combineReducers({
  theme: persistReducer(themePersistConfig, themeReducer),
  app: persistReducer(appSlicePersistConfig, appReducer),
  notifications: persistReducer(
    notificationsSlicePersistConfig,
    notificationsReducer
  ),
  units: persistReducer(unitsPersistConfig, unitsReducer),
  currencies: persistReducer(currenciesPersistConfig, currenciesReducer),
  quotations: persistReducer(quotationsPersistConfig, quotationsReducer),
  quotationSearch: persistReducer(
    quotationSearchPersistConfig,
    quotationSearchReducer
  ),
  user: persistReducer(userPersistConfig, userReducer),
  activity: persistReducer(activityPersistConfig, activityReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

// export const store = configureStore({
//   reducer: { cart: cartReducer },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({ serializableCheck: false }),
// });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

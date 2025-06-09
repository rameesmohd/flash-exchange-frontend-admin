import { configureStore  } from '@reduxjs/toolkit';
import adminReducer from './AdminSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

const adminPersistConfig = { key: 'Admin', storage, version: 1};
const adminPersistedReducer = persistReducer(adminPersistConfig, adminReducer);

export const store = configureStore({
  reducer: {
     Admin : adminPersistedReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persist = persistStore(store)
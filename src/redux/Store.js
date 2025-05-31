import { configureStore  } from '@reduxjs/toolkit';
import masterReducer from './MasterSlice';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

// const persistConfig = { key: 'Manager', storage, version: 1};
// const persistedReducer = persistReducer(persistConfig, managerReducer);

const masterPersistConfig = { key: 'Master', storage, version: 1};
const masterPersistedReducer = persistReducer(masterPersistConfig, masterReducer);

export const store = configureStore({
  reducer: {
     Master : masterPersistedReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persist = persistStore(store)
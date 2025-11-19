import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type NotificationSeverity = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  message: string;
  severity: NotificationSeverity;
  duration?: number;
  open: boolean;
}

interface UIState {
  notification: Notification;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  notification: {
    message: '',
    severity: 'info',
    duration: 4000,
    open: false,
  },
  sidebarOpen: false,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<{
        message: string;
        severity?: NotificationSeverity;
        duration?: number;
      }>
    ) => {
      state.notification = {
        message: action.payload.message,
        severity: action.payload.severity || 'info',
        duration: action.payload.duration ?? 4000,
        open: true,
      };
    },
    hideNotification: (state) => {
      state.notification.open = false;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
  },
});

export const { showNotification, hideNotification, toggleSidebar, setSidebarOpen, setTheme } =
  uiSlice.actions;

export default uiSlice.reducer;

import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  showNotification,
  hideNotification,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
} from '../store/slices/uiSlice';

/**
 * Custom hook to access UI state from Redux store
 * Replaces the NotificationContext with Redux integration
 */
export const useReduxUI = () => {
  const dispatch = useAppDispatch();
  const { notification, sidebarOpen, theme } = useAppSelector((state) => state.ui);

  return {
    notification,
    sidebarOpen,
    theme,
    notify: (
      message: string,
      options?: { severity?: 'success' | 'error' | 'info' | 'warning'; duration?: number }
    ) => {
      dispatch(
        showNotification({
          message,
          severity: options?.severity,
          duration: options?.duration,
        })
      );
    },
    hideNotification: () => dispatch(hideNotification()),
    toggleSidebar: () => dispatch(toggleSidebar()),
    setSidebarOpen: (open: boolean) => dispatch(setSidebarOpen(open)),
    setTheme: (newTheme: 'light' | 'dark') => dispatch(setTheme(newTheme)),
  };
};

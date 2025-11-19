import React, { ReactNode, useEffect } from 'react'
import { Snackbar, Alert } from '@mui/material'
import { useReduxUI } from '../hooks/useReduxUI'

/**
 * NotificationProvider now uses Redux for state management
 * This provides a UI component that displays notifications from Redux store
 */
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { notification, hideNotification } = useReduxUI()

  return (
    <>
      {children}
      {/* Accessible live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', left: -9999 }}>
        {notification.message}
      </div>
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={hideNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  )
}

/**
 * Legacy hook for backwards compatibility
 * Now wraps the Redux-based useReduxUI hook
 */
export const useNotification = () => {
  const { notify } = useReduxUI()
  return notify
}

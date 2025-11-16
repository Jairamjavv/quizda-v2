import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Snackbar, Alert } from '@mui/material'

type NotifyOptions = {
  severity?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

type NotifyFn = (message: string, opts?: NotifyOptions) => void

const NotificationContext = createContext<{
  notify: NotifyFn
} | null>(null)

export const useNotification = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx.notify
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<NotifyOptions['severity']>('info')
  const [duration, setDuration] = useState<number | undefined>(4000)

  const notify: NotifyFn = (msg, opts) => {
    setMessage(msg)
    setSeverity(opts?.severity || 'info')
    setDuration(opts?.duration ?? 4000)
    setOpen(true)
  }

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* Accessible live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', left: -9999 }}>{message}</div>
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpen(false)} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

export default NotificationContext

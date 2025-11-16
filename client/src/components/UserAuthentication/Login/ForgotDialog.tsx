import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert } from '@mui/material'
import { apiForgotPassword } from '../../../services/quizApi'

type Props = {
  open: boolean
  onClose: () => void
}

const ForgotDialog: React.FC<Props> = ({ open, onClose }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    setLoading(true)
    setErr(null)
    setMsg(null)
    try {
      await apiForgotPassword({ email })
      setMsg('If the email exists, a reset link has been sent.')
    } catch (e: any) {
      setErr('Request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Forgot password</DialogTitle>
      <DialogContent>
        {msg && <Alert severity="success">{msg}</Alert>}
        {err && <Alert severity="error">{err}</Alert>}
        <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={submit} variant="contained" disabled={loading}>
          {loading ? 'Sending…' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ForgotDialog

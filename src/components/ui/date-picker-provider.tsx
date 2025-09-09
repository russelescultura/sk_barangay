'use client'

import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import 'dayjs/locale/en'

// Configure dayjs locale
dayjs.locale('en')

// Create a theme that matches your app's design
const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6', // Blue color to match your app
    },
    secondary: {
      main: '#10b981', // Green color for accents
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            fontSize: '14px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        root: {
          zIndex: 9999,
          '& .MuiPaper-root': {
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'absolute',
            transform: 'none !important',
          },
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          zIndex: 9999,
        },
      },
    },
  },
})

interface DatePickerProviderProps {
  children: React.ReactNode
}

export function DatePickerProvider({ children }: DatePickerProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  )
}

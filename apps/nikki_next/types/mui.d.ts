import type { ReactNode } from "react"

declare module "@mui/material/Alert" {
  interface AlertProps {
    children?: ReactNode
  }
}

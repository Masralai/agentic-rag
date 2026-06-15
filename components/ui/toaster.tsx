"use client"

import { Toaster as SonnerToaster } from "sonner"

function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#1f1f1f",
          color: "#ffffff",
          border: "1px solid #252525",
          borderRadius: "0px",
          fontSize: "13px",
        },
      }}
      closeButton
      richColors
    />
  )
}

export { Toaster }

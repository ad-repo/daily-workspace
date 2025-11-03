import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../backend/data/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../backend/data/cert.pem')),
    },
  },
})


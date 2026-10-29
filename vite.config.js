import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { output: { assetFileNames: 'assets/[hash][extname]' } } }, // 사진 파일명(한글)을 주소에 쓰지 않음
})

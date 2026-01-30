import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081, // 🔥 Ép Vite chạy ở cổng 8081
    strictPort: true, // Nếu cổng 8081 bị chiếm, nó sẽ báo lỗi chứ không tự đổi sang cổng khác
  }
})
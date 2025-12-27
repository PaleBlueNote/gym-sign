import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // public 폴더에 있는 정적 파일들을 PWA 캐시에 포함시킵니다.
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'favicon-16x16.png', 'favicon-32x32.png'],
      manifest: {
        name: 'GymSign - 회원 계약 관리',
        short_name: 'GymSign',
        description: '필라테스/헬스장 전자계약 및 회원관리 시스템',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'android-chrome-192x192.png', // 파일명 수정됨
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png', // 파일명 수정됨
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});
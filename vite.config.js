import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),
    Components({
      // 可选配置
      resolvers: [PrimeVueResolver()],
      dirs: ['src/components'],  // 指定组件目录，默认是 'src/components'
      extensions: ['vue'],       // 要自动导入的文件类型
      deep: true,                // 是否搜索子目录
      dts: 'src/components.d.ts' // 自动生成的类型声明文件
  }),
  ],
  resolve: {
    alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
    }
}
});

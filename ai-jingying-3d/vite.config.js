import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `--mode offline` 把全部代码打进一个 HTML,断网时双击即可演示。
export default defineConfig(({ mode }) => {
  const offline = mode === 'offline';
  return {
    base: './',
    plugins: offline ? [viteSingleFile()] : [],
    build: {
      outDir: offline ? 'dist-offline' : 'dist',
      chunkSizeWarningLimit: 1200,
    },
  };
});

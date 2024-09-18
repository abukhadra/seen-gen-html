import { resolve } from 'path'

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
    build: {
        target: "ES2022",      
        emptyOutDir: false,
        assetsInlineLimit: Number.MAX_SAFE_INTEGER,
        cssMinify: true, 
		    minify: true,        
        rollupOptions: {
          input: {
            html: resolve(__dirname, 'src/html.js'),
          },
          output: {
            dir: 'dist',
            entryFileNames: 'html.js',
            chunkFileNames: 'html.js',
            assetFileNames: `html.js`
          }
        },
      },    
	plugins: [
    vue(), 
    viteSingleFile({ 
        useRecommendedBuildConfig: true,
        deleteInlinedFiles: true,    
        removeViteModuleLoader: true, 
    })
  ],
})

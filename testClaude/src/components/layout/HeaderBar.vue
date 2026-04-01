<template>
  <header class="header">
    <div class="logo">
      <Icon icon="carbon:code" class="logo-icon" />
      <span>Vue Preview</span>
    </div>
    <div class="actions">
      <button class="btn" @click="showDeps = true" title="配置依赖">
        <Icon icon="carbon:package" />
        <span>依赖</span>
      </button>
      <button class="btn" @click="exportProject" title="导出项目">
        <Icon icon="carbon:export" />
        <span>导出</span>
      </button>
      <button class="btn theme-btn" @click="toggleTheme" :title="theme === 'light' ? '切换到暗色' : '切换到亮色'">
        <Icon :icon="theme === 'light' ? 'carbon:moon' : 'carbon:sun'" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { useStore } from '@/stores';
import { storeToRefs } from 'pinia';
import JSZip from 'jszip';

const store = useStore();
const { theme } = storeToRefs(store);
const showDeps = ref(false);

function toggleTheme() {
  store.setTheme(theme.value === 'light' ? 'dark' : 'light');
}

async function exportProject() {
  const files = store.exportProject();
  const zip = new JSZip();

  // Add source files
  Object.entries(files).forEach(([path, content]) => {
    zip.file(path, content);
  });

  // Add package.json
  const packageJson = {
    name: 'vue-preview-project',
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vue-tsc && vite build',
      preview: 'vite preview'
    },
    dependencies: {
      vue: '^3.4.0'
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^5.0.0',
      typescript: '^5.3.0',
      vite: '^5.0.0',
      'vue-tsc': '^1.8.0'
    }
  };
  zip.file('package.json', JSON.stringify(packageJson, null, 2));

  // Add vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
`;
  zip.file('vite.config.ts', viteConfig);

  // Add index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue Project</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"><\/script>
</body>
</html>
`;
  zip.file('index.html', indexHtml);

  // Add tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      module: 'ESNext',
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'preserve',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    },
    include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
    references: [{ path: './tsconfig.node.json' }]
  };
  zip.file('tsconfig.json', JSON.stringify(tsConfig, null, 2));

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vue-project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

defineExpose({ showDeps });
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 24px;
  color: var(--accent-color);
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn:hover {
  background: var(--bg-hover);
  border-color: var(--accent-color);
}

.theme-btn {
  padding: 6px;
  font-size: 16px;
}
</style>

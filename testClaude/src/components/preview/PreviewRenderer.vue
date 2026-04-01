<template>
  <div class="preview-renderer">
    <iframe
      class="preview-iframe"
      sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
      :srcdoc="iframeContent"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Dependency } from '@/types';

const props = defineProps<{
  files: Record<string, string>;
  dependencies: Dependency[];
}>();

const dependenciesHtml = computed(() => {
  return props.dependencies.map(dep => {
    if (dep.type === 'css') {
      return `<link rel="stylesheet" href="${dep.url}">`;
    } else {
      return `<script src="${dep.url}"><\/script>`;
    }
  }).join('\n');
});

const iframeContent = computed(() => {
  // Generate file URLs
  const fileUrls = Object.entries(props.files).map(([path, content]) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    return { path, url };
  });

  const filesMap = fileUrls.reduce((acc, { path, url }) => {
    acc[path] = url;
    return acc;
  }, {} as Record<string, string>);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue Preview</title>
  ${dependenciesHtml.value}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    #app { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="importmap">
  {
    "imports": {
      "vue": "https://cdn.jsdelivr.net/npm/vue@3.4.0/dist/vue.esm-browser.js",
      "@vue/runtime-core": "https://cdn.jsdelivr.net/npm/vue@3.4.0/dist/vue.esm-browser.js"
    }
  }
  <\/script>
  <script type="module">
    import { createApp, h, ref, computed, watch, onMounted, onUnmounted } from 'vue';

    // File system shim
    const files = ${JSON.stringify(filesMap)};

    // Simple SFC compiler
    function compileSFC(source) {
      const templateMatch = source.match(/<template>([\\s\\S]*?)<\\/template>/);
      const scriptMatch = source.match(/<script(\\s[^>]*)?>([\\s\\S]*?)<\\/script>/);
      const styleMatch = source.match(/<style(\\s[^>]*)?>([\\s\\S]*?)<\\/style>/);

      let template = templateMatch ? templateMatch[1].trim() : '';
      let script = scriptMatch ? scriptMatch[2].trim() : '';
      let styles = styleMatch ? styleMatch[2].trim() : '';

      // Extract scoped attribute
      const scoped = styleMatch && styleMatch[1] && styleMatch[1].includes('scoped');

      // Generate unique scope id
      const scopeId = scoped ? 'data-v-' + Math.random().toString(36).substr(2, 9) : null;

      // Process template for scoped styles
      if (scopeId) {
        template = template.replace(/<([\\w-]+)([^>]*)>/g, (match, tag, attrs) => {
          if (attrs.includes(scopeId)) return match;
          return '<' + tag + attrs + ' ' + scopeId + '>';
        });

        // Add scope attribute to CSS selectors
        styles = styles.replace(/([\\.#][\\w-]+)([^,{]*)/g, (match, selector, rest) => {
          return selector + '[' + scopeId + ']' + rest;
        });
      }

      return {
        template,
        code: script,
        styles,
        scopeId
      };
    }

    // Create component from .vue file
    async function createComponent(source) {
      const compiled = compileSFC(source);

      // Create render function from template
      const renderFn = new Function('ctx', \`
        with(ctx) {
          return \${compiled.template}\`;
        }
      \`);

      // Create component options
      const componentCode = \`
        return async () => {
          const { ref, computed, watch, onMounted, onUnmounted } = await import('vue');
          \${compiled.code}
          return __component;
        }
      \`;

      const getComponent = new Function(componentCode);
      const componentOptions = await getComponent();

      // Add styles to document
      if (compiled.styles) {
        const styleEl = document.createElement('style');
        styleEl.textContent = compiled.styles;
        document.head.appendChild(styleEl);
      }

      return {
        ...componentOptions,
        render: (ctx) => {
          const html = renderFn(ctx);
          const temp = document.createElement('template');
          temp.innerHTML = html;
          return temp.content;
        }
      };
    }

    // Mount app
    try {
      const appVueUrl = files['/src/App.vue'];
      if (!appVueUrl) {
        throw new Error('App.vue not found');
      }
      const App = await import(appVueUrl);
      const app = createApp(App.default);
      app.mount('#app');
    } catch (err) {
      document.getElementById('app').innerHTML = '<div style="color: red; padding: 20px;">Error: ' + err.message + '</div>';
      console.error(err);
    }
  <\/script>
</body>
</html>`;
});
</script>

<style scoped>
.preview-renderer {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}
</style>

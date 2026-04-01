<template>
  <div ref="editorRef" class="monaco-editor"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// Configure Monaco workers
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  }
};

const props = defineProps<{
  value: string;
  language?: string;
  theme?: string;
}>();

const emit = defineEmits<{
  (e: 'change', value: string): void;
}>();

const editorRef = ref<HTMLElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
let disposables: monaco.IDisposable[] = [];

onMounted(() => {
  if (!editorRef.value) return;

  editor = monaco.editor.create(editorRef.value, {
    value: props.value,
    language: props.language || 'plaintext',
    theme: props.theme || 'vs',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    padding: { top: 16, bottom: 16 },
    folding: true,
    renderLineHighlight: 'line',
    matchBrackets: 'always',
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
  });

  // Listen for content changes
  const changeDisposable = editor.onDidChangeModelContent(() => {
    if (editor) {
      emit('change', editor.getValue());
    }
  });
  disposables.push(changeDisposable);
});

onBeforeUnmount(() => {
  disposables.forEach(d => d.dispose());
  disposables = [];
  if (editor) {
    editor.dispose();
    editor = null;
  }
});

// Watch for external value changes
watch(() => props.value, (newValue) => {
  if (editor && newValue !== editor.getValue()) {
    editor.setValue(newValue);
  }
});

// Watch for language changes
watch(() => props.language, (newLanguage) => {
  if (editor && newLanguage) {
    monaco.editor.setModelLanguage(editor.getModel()!, newLanguage);
  }
});

// Watch for theme changes
watch(() => props.theme, (newTheme) => {
  if (newTheme) {
    monaco.editor.setTheme(newTheme);
  }
});
</script>

<style scoped>
.monaco-editor {
  width: 100%;
  height: 100%;
}
</style>

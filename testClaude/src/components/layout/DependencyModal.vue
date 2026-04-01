<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>配置依赖</h3>
          <button class="close-btn" @click="close">
            <Icon icon="carbon:close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="add-dep">
            <input
              v-model="newDep.name"
              placeholder="依赖名称 (如: lodash)"
              class="input"
            />
            <input
              v-model="newDep.url"
              placeholder="CDN URL"
              class="input"
            />
            <select v-model="newDep.type" class="select">
              <option value="js">JS</option>
              <option value="css">CSS</option>
            </select>
            <button class="btn btn-primary" @click="addDependency">添加</button>
          </div>
          <div class="deps-list">
            <div v-for="dep in dependencies" :key="dep.id" class="dep-item">
              <div class="dep-info">
                <span class="dep-name">{{ dep.name }}</span>
                <span class="dep-type" :class="dep.type">{{ dep.type.toUpperCase() }}</span>
              </div>
              <div class="dep-url">{{ dep.url }}</div>
              <button class="btn-icon" @click="removeDep(dep.id)" title="删除">
                <Icon icon="carbon:trash-can" />
              </button>
            </div>
            <div v-if="dependencies.length === 0" class="empty">
              暂无配置的依赖
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useStore } from '@/stores';

const store = useStore();
const dependencies = computed(() => store.dependencies);

const props = defineProps<{
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const newDep = ref({
  name: '',
  url: '',
  type: 'js' as 'js' | 'css'
});

function close() {
  emit('update:modelValue', false);
}

function addDependency() {
  if (!newDep.value.name || !newDep.value.url) return;

  store.addDependency({
    name: newDep.value.name,
    url: newDep.value.url,
    type: newDep.value.type
  });

  newDep.value = { name: '', url: '', type: 'js' };
}

function removeDep(id: string) {
  store.removeDependency(id);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 8px;
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.add-dep {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
}

.input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.deps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dep-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.dep-info {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 150px;
}

.dep-name {
  font-weight: 500;
}

.dep-type {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  background: var(--bg-tertiary);
}

.dep-type.js {
  color: #f7df1e;
}

.dep-type.css {
  color: #264de4;
}

.dep-url {
  flex: 1;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
}

.btn-icon:hover {
  color: #dc4446;
}

.empty {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
</style>

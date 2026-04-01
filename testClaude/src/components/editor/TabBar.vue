<template>
  <div class="tab-bar">
    <div
      v-for="tab in openTabs"
      :key="tab.id"
      class="tab"
      :class="{ active: activeTabId === tab.id }"
      @click="selectTab(tab.id)"
    >
      <span class="tab-name" :class="{ modified: tab.isModified }">
        {{ tab.name }}
      </span>
      <button class="close-btn" @click.stop="closeTab(tab.id)">
        <Icon icon="carbon:close" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useStore } from '@/stores';
import { storeToRefs } from 'pinia';

const store = useStore();
const { openTabs, activeTabId } = storeToRefs(store);

function selectTab(tabId: string) {
  const tab = openTabs.value.find(t => t.id === tabId);
  if (tab) {
    store.openFile(tab.fileId);
  }
}

function closeTab(tabId: string) {
  store.closeTab(tabId);
}
</script>

<style scoped>
.tab-bar {
  display: flex;
  align-items: center;
  height: 36px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
  scrollbar-width: none;
}

.tab-bar::-webkit-scrollbar {
  display: none;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 100%;
  min-width: 100px;
  max-width: 180px;
  cursor: pointer;
  border-right: 1px solid var(--border-color);
  background: var(--bg-secondary);
  transition: all 0.2s;
}

.tab:hover {
  background: var(--bg-hover);
}

.tab.active {
  background: var(--bg-primary);
  border-bottom: 2px solid var(--accent-color);
}

.tab-name {
  flex: 1;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-name.modified::after {
  content: '●';
  margin-left: 4px;
  color: var(--accent-color);
  font-size: 8px;
}

.tab.active .tab-name {
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px;
  font-size: 12px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.tab:hover .close-btn {
  opacity: 1;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
</style>

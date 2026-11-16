<script setup lang="ts">
const props = defineProps<{
  package?: string;
}>();

const pkg = props.package || 'doofpi';

const tabs = [
  { id: 'bun', name: 'Bun', cmd: `bun add ${pkg}` },
  { id: 'npm', name: 'npm', cmd: `npm install ${pkg}` },
  { id: 'pnpm', name: 'pnpm', cmd: `pnpm add ${pkg}` },
  { id: 'yarn', name: 'Yarn', cmd: `yarn add ${pkg}` }
];

const activeTab = ref('bun');
const copied = ref(false);

const currentCommand = computed(() => tabs.find(t => t.id === activeTab.value)?.cmd ?? '');
const currentCode = computed(() => `\`\`\`bash\n${currentCommand.value}\n\`\`\``);

function copy() {
  navigator.clipboard.writeText(currentCommand.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="my-6 relative">
    <div class="flex items-center justify-between mb-2">
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="px-3 py-1.5 text-sm font-semibold rounded-lg transition-all border"
          :class="
            activeTab === tab.id
              ? 'bg-accent-soft text-accent border-brand-300'
              : 'bg-surface text-muted border-line-strong hover:border-brand-300 hover:text-ink'
          "
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>
      <button
        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 bg-surface border"
        :class="
          copied
            ? 'border-brand-300 text-accent bg-accent-soft'
            : 'border-line-strong text-body hover:border-brand-400 hover:text-accent'
        "
        @click="copy"
      >
        <Icon :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" class="text-sm" />
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <MDC :value="currentCode" />
  </div>
</template>

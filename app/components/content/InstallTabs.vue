<script setup lang="ts">
const props = defineProps<{
  package?: string;
}>();

const pkg = props.package || 'doofpi';

const tabs = [
  { id: 'bun', name: 'Bun', code: `\`\`\`bash\nbun add ${pkg}\n\`\`\`` },
  { id: 'npm', name: 'npm', code: `\`\`\`bash\nnpm install ${pkg}\n\`\`\`` },
  { id: 'pnpm', name: 'pnpm', code: `\`\`\`bash\npnpm add ${pkg}\n\`\`\`` },
  { id: 'yarn', name: 'Yarn', code: `\`\`\`bash\nyarn add ${pkg}\n\`\`\`` }
];

const activeTab = ref('bun');
const copied = ref(false);

const currentCode = computed(() => {
  return tabs.find(t => t.id === activeTab.value)?.code || '';
});

const currentCommand = computed(() => {
  const tab = tabs.find(t => t.id === activeTab.value);
  if (!tab) return '';
  // Extract command from the markdown code block
  return tab.code.replace(/```bash\n|\n```/g, '');
});

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
          @click="activeTab = tab.id"
          class="px-3 py-1.5 text-sm font-semibold rounded-lg transition-all border"
          :class="
            activeTab === tab.id
              ? 'bg-orange-50 text-orange-600 border-orange-300'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          "
        >
          {{ tab.name }}
        </button>
      </div>
      <button
        @click="copy"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-md bg-white border"
        :class="
          copied
            ? 'border-orange-300 text-orange-600 bg-orange-50'
            : 'border-slate-200 text-slate-700 hover:border-orange-400 hover:text-orange-600'
        "
      >
        <Icon :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" class="text-sm" />
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <MDC :value="currentCode" />
  </div>
</template>

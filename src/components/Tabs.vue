<script setup lang="ts">
const { items, active } = defineProps<{
    items: Record<string, string>;
    active: string;
}>();
</script>

<template>
  <ul class="nav nav-tabs" role="tablist">
    <li class="nav-item" role="presentation" v-for="item in Object.keys(items)">
      <button
        :class="'nav-link ' + (active === item ? 'active' : '')"
        :id="`${item}-tab`"
        data-bs-toggle="tab"
        :data-bs-target="`#${item}`"
        type="button"
        role="tab"
        :aria-controls="item"
        :aria-selected="active === item ? 'true' : 'false'"
      >
        {{ items[item] }}
      </button>
    </li>
  </ul>
  <div class="tab-content">
    <div
      :class="'tab-pane fade' + (active === item ? 'show active' : '')"
      :id="item"
      role="tabpanel"
      :aria-labelledby="`${item}-tab`"
      v-for="item in Object.keys(items)"
    >
        <slot :name="item"></slot>
    </div>
  </div>
</template>

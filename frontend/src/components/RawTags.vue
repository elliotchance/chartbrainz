<script setup lang="ts">
import Tag from "./Tag.vue";

const { tags, cls } = defineProps<{
  tags: string;
  cls: string;
}>();

function parsedTags(): Array<[string, number]> {
  let parsedTags: Array<[string, number]> = [];
  for (const tag of (tags || "").split(";")) {
    const [count, name] = tag.split(" ", 2);
    parsedTags.push([name, parseInt(count, 10)]);
  }

  return parsedTags;
}

function orderedTags() {
  return parsedTags()
    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
    .map((x: [string, number]) => x[0]);
}

function count() {
  return (tags || "").split(";").length;
}
</script>

<template>
  <div>
    <span v-for="(name, i) in orderedTags()">
      {{ i > 0 ? ", " : "" }}<Tag :name="name" :cls="cls" />
    </span>
  </div>
</template>

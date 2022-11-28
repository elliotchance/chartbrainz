<script setup lang="ts">
import { ref } from "vue";
import { ChartReleaseGroupResult } from "../types";
import ReleaseGroupRows from "./ReleaseGroupRows.vue";
import { Button } from "ant-design-vue";
let results = ref<ChartReleaseGroupResult[]>([]);

async function load() {
  const response = await fetch("http://localhost:3000/v1/chart", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    // body: JSON.stringify({ title: "Vue POST Request Example" })
  });
  const resp: {
    results: ChartReleaseGroupResult[];
  } = await response.json();

  results.value = resp.results; 
}

load();
</script>

<template>
  <ReleaseGroupRows :results="results" />
  <Button type="primary">Primary Button</Button>
  <Button>Default Button</Button>
  <Button type="dashed">Dashed Button</Button>
</template>

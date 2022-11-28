<template>
  <Disclosure>
    <DisclosureButton class="py-2">
      Is team pricing available?
    </DisclosureButton>
    <DisclosurePanel class="text-gray-500">
      Yes! You can purchase a license that you can share with your entire team.
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
</script>

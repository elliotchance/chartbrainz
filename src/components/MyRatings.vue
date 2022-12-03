<script setup lang="ts">
import ReleaseRow from "./ReleaseRow.vue";
import {ref} from 'vue';

// const { name, disambiguation } = defineProps<{
//   name: string;
//   disambiguation: string;
// }>();

const releases = ref([
    {
        release_group_gid: '',
        release_group: 'Foo',
        artist: 'Bar',
        genres: 'a, b'
    }
]);
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">First</th>
              <th scope="col">Last</th>
              <th scope="col">Handle</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(release, i) in releases">
              <ReleaseRow
                :release="release"
                :number="i + 1"
              />
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

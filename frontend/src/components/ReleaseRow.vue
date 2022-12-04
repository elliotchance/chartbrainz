<script setup lang="ts">
import Date from "./Date.vue";
import RatingSelector from "./RatingSelector.vue";
import RawTags from "./RawTags.vue";
import { ReleaseType } from "../types";
import ReleaseGroupCoverArt from "./ReleaseGroupCoverArt.vue";
import { submitRating, ratingFor } from "../lib";
import { ref } from "vue";

const { release, number, isLoggedIn } = defineProps<{
  release: ReleaseType;
  number: number;
  isLoggedIn: boolean;
}>();

const refreshKey = ref(0);
</script>

<template>
  <tr>
    <td>
      <ReleaseGroupCoverArt
        :release-id="release.id"
        :release-title="release.title"
      />
    </td>
    <td class="h5" style="text-align: right">{{ number }}.</td>
    <td>
      <a
        :href="'https://musicbrainz.org/release-group/' + release.id"
        target="_blank"
        >{{ release.title }}</a
      ><br />
      <strong>{{ release.artist }}</strong>
      <br />
      <small
        ><Date
          :year="release.releaseYear"
          :month="release.releaseMonth"
          :day="release.releaseDay"
      /></small>
      <br />
      <small><RawTags :tags="release.rawTags || ''" cls="genre_tag" /></small>
    </td>
    <td style="text-align: right">
      <RatingSelector
        :release-group="release.id"
        :rating="ratingFor(release.id)"
        :submit-rating="(releaseGroup: string, rating: number): Promise<void> =>
          submitRating(releaseGroup, rating).then(() => {
            refreshKey = Math.floor(Math.random() * 1e6);
          })
        "
        :refresh-key="refreshKey"
        v-if="isLoggedIn"
      />
    </td>
    <td style="text-align: center">{{ (release.rating || 0) / 20 }}</td>
    <td style="text-align: center">{{ release.ratingCount }}</td>
  </tr>
</template>

<style scoped>
.genre_tag {
  text-decoration: none;
}
</style>

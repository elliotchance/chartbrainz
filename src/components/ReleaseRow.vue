<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import Date from './Date.vue';
import RatingSelector from './RatingSelector.vue';
import RawTags from './RawTags.vue';

const { release, number, submitRating, isLoggedIn } = defineProps<{
  release: any;
  number: number;
  submitRating: (releaseGroup: any, rating: number) => Promise<void>;
  isLoggedIn: boolean;
}>();

function ratingFor(releaseGroup: string) {
  return parseInt(
    window.localStorage[`release_group:${releaseGroup}:rating`] || "0",
    10
  );
}
</script>

<template>
  <tr>
    <td>
      <img
        :src="
          'https://coverartarchive.org/release-group/' +
          release.release_group_gid +
          '/front-250'
        "
        :alt="release.release_group"
        width="100"
      />
    </td>
    <td class="h5" style="text-align: right">{{ number }}.</td>
    <td>
      <a
        :href="
          'https://musicbrainz.org/release-group/' + release.release_group_gid
        "
        target="_blank"
        >{{ release.release_group }}</a
      ><br />
      <strong>{{ release.artist }}</strong>
      <br />
      <small
        ><Date
          :year="release.release_year"
          :month="release.release_month"
          :day="release.release_day"
      /></small>
      <br />
      <small><RawTags :tags="release.genres" cls="genre_tag" /></small>
    </td>
    <td style="text-align: right">
      <RatingSelector
        :release-group="release.release_group_gid"
        :rating="ratingFor(release.release_group_gid)"
        :submit-rating="
          (releaseGroup: any, rating: number) => {
            submitRating(releaseGroup, rating).then(() => getCurrentInstance()?.proxy?.$forceUpdate());
          }
        "
        v-if="isLoggedIn"
      />
    </td>
    <td style="text-align: center">{{ release.rating / 20 }}</td>
    <td style="text-align: center">{{ release.rating_count }}</td>
  </tr>
</template>

<style scoped>
.genre_tag {
  text-decoration: none;
}
</style>

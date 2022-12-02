<script setup lang="ts">
import { ref } from "vue";
import Card from "./Card.vue";
import Date from "./Date.vue";
import RatingSelector from "./RatingSelector.vue";

const { releaseSearchResult, submitRating, closeSearch, user } = defineProps<{
  releaseSearchResult: any;
  submitRating: (releaseGroup: any, rating: number) => Promise<void>;
  closeSearch: () => void;
  user: string;
}>();

const refreshKey = ref(Math.floor(Math.random() * 1e6));

function ratingFor(releaseGroup: string) {
  return parseInt(
    window.localStorage[`release_group:${releaseGroup}:rating`] || "0",
    10
  );
}
</script>

<template>
  <Card title="Releases" title-class="h5" :close="closeSearch">
    <span v-if="releaseSearchResult.length === 0">No releases.</span>
    <table class="table" v-if="releaseSearchResult.length > 0">
      <tbody>
        <tr v-for="release in releaseSearchResult">
          <td style="width: 110px">
            <img
              :src="
                'https://coverartarchive.org/release-group/' +
                release.id +
                '/front-250'
              "
              :alt="release.release_group"
              width="100"
            />
          </td>
          <td>
            <a :href="'https://musicbrainz.org/release-group/' + release.id">{{
              release.title
            }}</a>
            ({{ release.type }})<br />{{ release.artist }}<br />
            <Date
              :year="release.releaseDate?.split('-')[0]"
              :month="release.releaseDate?.split('-')[1]"
              :day="release.releaseDate?.split('-')[2]"
              v-if="release.releaseDate"
            /><br />{{ (release.tags || []).join(",") }}
          </td>
          <td style="text-align: right">
            <RatingSelector
              :release-group="release.id"
              :rating="ratingFor(release.id)"
              :submit-rating="
                (releaseGroup: any, rating: number) => {
                  submitRating(releaseGroup, rating).then(
                    () => (refreshKey = Math.floor(Math.random() * 1e6))
                  );
                }
              "
              v-if="user !== ''"
              :refresh-key="refreshKey"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </Card>
</template>

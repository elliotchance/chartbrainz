<script setup lang="ts">
import { ref } from "vue";
import Card from "./Card.vue";
import Date from "./Date.vue";
import RatingSelector from "./RatingSelector.vue";
import ReleaseGroupCoverArt from "./ReleaseGroupCoverArt.vue";
import { ReleaseType } from "../types";
import { submitRating, ratingFor } from "../lib";

const { releaseSearchResult, closeSearch, user } = defineProps<{
  releaseSearchResult: ReleaseType[];
  closeSearch: () => void;
  user?: string;
}>();

const refreshKey = ref(Math.floor(Math.random() * 1e6));
</script>

<template>
  <Card title="Releases" title-class="h5" :close="closeSearch">
    <span v-if="releaseSearchResult.length === 0">No releases.</span>
    <table class="table" v-if="releaseSearchResult.length > 0">
      <tbody>
        <tr v-for="release in releaseSearchResult">
          <td style="width: 110px">
            <ReleaseGroupCoverArt
              :release-id="release.id"
              :release-title="release.title"
            />
          </td>
          <td>
            <a :href="'https://musicbrainz.org/release-group/' + release.id">{{
              release.title
            }}</a>
            ({{ release.type }})<br />{{ release.artist }}<br />
            <Date
              :year="release.releaseYear"
              :month="release.releaseMonth"
              :day="release.releaseDay"
              v-if="release.releaseYear"
            /><br />{{ (release.tags || []).join(",") }}
          </td>
          <td style="text-align: right">
            <RatingSelector
              :release-group="release.id"
              :rating="ratingFor(release.id)"
              :submit-rating="
                (releaseGroup: string, rating: number): Promise<void> =>
                  submitRating(releaseGroup, rating).then(() => {
                      refreshKey = Math.floor(Math.random() * 1e6);
                  })
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

<script setup lang="ts">
import { ReleaseType, GenreParentChildType } from "../types";
import DecadeSelector from "./DecadeSelector.vue";
import GenreSelector from "./GenreSelector.vue";
import { ref, computed } from "vue";
import { backendDomain, URLState } from "../lib";
import ReleaseRow from "./ReleaseRow.vue";
import Card from "./Card.vue";

const { user } = defineProps<{
  user?: string;
}>();

const currentGenre = ref("");
const allReleases = ref<ReleaseType[]>([]);
const genres = ref<GenreParentChildType[]>([]);
const decade = ref(URLState.get("decade"));
const path = ref<string[]>([]);

function pathForGenre(
  genres: Array<GenreParentChildType>,
  genre: string
): string[] {
  let path = [genre];
  let currentGenre = genre;

  // 20 is just a safety measure in case theres a circular reference.
  for (let i = 0; i < 20; i++) {
    const parents = genres.filter(
      (g: GenreParentChildType) => g.child_genre === currentGenre
    );

    if (parents.length === 0) {
      break;
    }

    const parent = parents[0].parent_genre;
    path.unshift(parent);
    currentGenre = parent;
  }

  return path;
}

function setDecade(d: string) {
  decade.value = d;
  URLState.set({ decade: d });
}

function setCurrentGenre(genre: string, depth: number) {
  if (genre === "") {
    path.value = [];
  } else if (depth >= path.value.length) {
    path.value.push(genre);
  } else {
    path.value = path.value.slice(0, depth);
    path.value[depth] = genre;
  }

  currentGenre.value = genre;

  // When the genre changes we should also reset the decade.
  URLState.set({ genre, decade: "" });
}

function setPath(p: string[]) {
  path.value = p;
  if (p.length > 0) {
    currentGenre.value = p[p.length - 1];
  } else {
    currentGenre.value = "";
  }

  // When the genre changes we should also reset the decade.
  URLState.set({ genre: currentGenre.value, decade: "" });
}

function load(path: string) {
  $.ajax(path)
    .then(
      (
        data?: {
          artist: string;
          release_group_gid: string;
          release_group: string;
          release_year: number;
          release_month: number;
          release_day: number;
          rating: number;
          rating_count: number;
          genres: string;
        }[]
      ) => {
        allReleases.value = (data || []).map((r): ReleaseType => {
          return {
            artist: r.artist,
            id: r.release_group_gid,
            title: r.release_group,
            releaseYear: r.release_year,
            releaseMonth: r.release_month,
            releaseDay: r.release_day,
            rating: r.rating,
            ratingCount: r.rating_count,
            rawTags: r.genres,
          };
        });
      }
    )
    .catch(() => {
      allReleases.value = [];
    });
}

$.ajax(`${backendDomain}/data/genres.json`).then(
  (data?: GenreParentChildType[]) => {
    genres.value = data || [];
    currentGenre.value = URLState.get("genre");
    if (currentGenre.value === "") {
      load(`${backendDomain}/data/top.json`);
    } else {
      path.value = pathForGenre(genres.value, currentGenre.value);
      load(
        `${backendDomain}/data/genre/${currentGenre.value.replace(
          /\s/g,
          "-"
        )}.json`
      );
    }
  }
);

const rootGenres = computed(() => {
  const all = new Set([
    ...genres.value.map((genre: GenreParentChildType) => genre.parent_genre),
    ...genres.value.map((genre: GenreParentChildType) => genre.child_genre),
  ]);

  const children = new Set(
    genres.value.map((genre: GenreParentChildType) => genre.child_genre)
  );

  return Array.from(
    new Set([...all].filter((element) => !children.has(element)))
  );
});

const filteredReleases = computed(() => {
  if (decade.value !== "") {
    const minYear = parseInt(decade.value.substr(0, 4), 10);
    const maxYear = minYear + 9;

    return allReleases.value.filter(
      (r: ReleaseType) =>
        (r.releaseYear || 0) >= minYear && (r.releaseYear || 0) <= maxYear
    );
  }
  return allReleases.value;
});
</script>

<template>
  <div class="row">
    <div class="col-3">
      <Card title="Filter" title-class="h5">
        <div class="container">
          <br />
          <DecadeSelector
            :decade="decade"
            :set-decade="setDecade"
            :releases="allReleases"
          />
          <br />
          <GenreSelector
            :genres="genres"
            :root-genres="Array.from(rootGenres)"
            :set-current-genre="setCurrentGenre"
            :depth="0"
            :path="path"
            :current-genre="currentGenre"
            :set-path="setPath"
          />
        </div>
      </Card>
    </div>

    <div class="col-9">
      <Card
        :title="`Top ${currentGenre} releases of ${
          decade ? 'the ' + decade : 'all-time'
        }`"
        title-class="h5"
      >
        <h2 v-if="filteredReleases.length === 0">No releases.</h2>
        <table class="table" v-if="filteredReleases.length > 0">
          <thead>
            <tr>
              <th width="100">&nbsp;</th>
              <th width="50">&nbsp;</th>
              <th>&nbsp;</th>
              <th>&nbsp;</th>
              <th style="text-align: center">Average</th>
              <th style="text-align: center">Ratings</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(release, i) in filteredReleases">
              <ReleaseRow
                :release="release"
                :number="i + 1"
                :is-logged-in="user !== ''"
              />
            </template>
          </tbody>
        </table>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ParentChildGenre } from "../types";
import { pathForGenre } from "../utils";

const {
  genres,
  rootGenres,
  setCurrentGenre,
  path,
  depth,
  currentGenre,
  setPath,
} = defineProps<{
  genres: ParentChildGenre[];
  rootGenres: string[];
  setCurrentGenre: any;
  path: string[];
  depth: number;
  currentGenre: string;
  setPath: any;
}>();

const filter = ref("");

function filteredGenres() {
  const all = new Set([
    ...genres.map((genre: ParentChildGenre) => genre.parent_genre),
    ...genres.map((genre: ParentChildGenre) => genre.child_genre),
  ]);

  return [...all].filter((genre) => genre.indexOf(filter.value) >= 0).sort();
}

function selectGenre(genre: string) {
  filter.value = "";
  setPath(pathForGenre(genres, genre));
}
</script>

<template>
  <form autocomplete="no">
    <div class="input-group mb-3">
      <input
        type="text"
        class="form-control"
        placeholder="Filter genres..."
        v-model="filter"
      />
    </div>
    <div v-if="filter !== ''">
      <ul class="genre">
        <li v-for="genre in filteredGenres()">
          <small>
            <tag :name="genre" @click="() => selectGenre(genre)">{{
              genre
            }}</tag>
          </small>
        </li>
      </ul>
    </div>
    <div v-if="filter === ''">
      <a href="#" @click="() => setCurrentGenre('', 0)">
        <strong v-if="currentGenre === ''">All Genres</strong>
        <span v-if="currentGenre !== ''">All Genres</span>
      </a>
      <genre-list
        :genres="genres"
        :root-genres="rootGenres"
        :set-current-genre="setCurrentGenre"
        :depth="0"
        :path="path"
      />
    </div>
  </form>
</template>

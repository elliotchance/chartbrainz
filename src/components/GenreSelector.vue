<script setup lang="ts">
import { ref } from "vue";
import GenreList from "./GenreList.vue";
import Tag from "./Tag.vue";

const {
  genres,
  rootGenres,
  setCurrentGenre,
  path,
  currentGenre,
  setPath,
} = defineProps<{
  genres: Genre[];
  rootGenres: string[];
  setCurrentGenre: (path: string, depth: number) => void;
  path: string[];
  currentGenre: string;
  setPath: (path: string[]) => void;
}>();

const filter = ref("");

type Genre = {
  parent_genre: string;
  child_genre: string;
};

function pathForGenre(genres: Genre[], genre: string) {
  let path = [genre];
  let currentGenre = genre;

  // 20 is just a safety measure in case theres a circular reference.
  for (let i = 0; i < 20; i++) {
    const parents = genres.filter((g: Genre) => g.child_genre === currentGenre);

    if (parents.length === 0) {
      break;
    }

    const parent = parents[0].parent_genre;
    path.unshift(parent);
    currentGenre = parent;
  }

  return path;
}

function filteredGenres(): Array<string> {
  const all = new Set<string>([
    ...genres.map((genre: any) => genre.parent_genre),
    ...genres.map((genre: any) => genre.child_genre),
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
            <Tag :name="genre" @click="() => selectGenre(genre)">{{
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
      <GenreList
        :genres="genres"
        :root-genres="rootGenres"
        :set-current-genre="setCurrentGenre"
        :depth="0"
        :path="path"
      />
    </div>
  </form>
</template>

<style scoped>
ul.genre {
  margin-left: 1em;
  padding: 0;
  list-style: none;
}
</style>

<script setup lang="ts">
import { ref, computed } from "vue";
import GenreList from "./GenreList.vue";
import Tag from "./Tag.vue";
import { GenreParentChildType } from "../types";

const { genres, rootGenres, setCurrentGenre, path, currentGenre, setPath } =
  defineProps<{
    genres: GenreParentChildType[];
    rootGenres: string[];
    setCurrentGenre: (path: string, depth: number) => void;
    path: string[];
    currentGenre: string;
    setPath: (path: string[]) => void;
  }>();

const filter = ref("");

function pathForGenre(genres: GenreParentChildType[], genre: string) {
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
        <li
          v-for="genre in [...new Set<string>([
    ...genres.map((genre: GenreParentChildType) => genre.parent_genre),
    ...genres.map((genre: GenreParentChildType) => genre.child_genre),
  ])].filter((genre: string) => genre.indexOf(filter) >= 0).sort()"
        >
          <small>
            <Tag :name="genre" @click="() => selectGenre(genre)">{{
              genre
            }}</Tag>
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

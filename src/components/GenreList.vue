<script setup lang="ts">
import GenreList from "./GenreList.vue";
import Tag from "./Tag.vue";

type Genre = {
  parent_genre: string;
  child_genre: string;
};

const { genres, rootGenres, setCurrentGenre, path, depth } = defineProps<{
  genres: Genre[];
  rootGenres: string[];
  setCurrentGenre: (genre: string, depth: number) => void;
  path: string[];
  depth: number;
}>();
</script>

<template>
  <ul class="genre">
    <li v-for="genre in rootGenres">
      <small>
        <strong v-if="genre === path[depth]">
          <Tag :name="genre" @click="() => setCurrentGenre(genre, depth)">
            {{ genre }}
          </tag>
        </strong>
        <Tag
          :name="genre"
          @click="() => setCurrentGenre(genre, depth)"
          v-if="depth === path.length"
          >{{ genre }}</tag
        >
      </small>

      <GenreList
        :genres="genres"
        :root-genres="
          genres
            .filter((g: Genre) => g.parent_genre === genre)
            .map((g: Genre) => g.child_genre)
        "
        :set-current-genre="setCurrentGenre"
        v-if="genre === path[depth]"
        :path="path"
        :depth="depth + 1"
      />
    </li>
  </ul>
</template>

<style scoped>
ul.genre {
  margin-left: 1em;
  padding: 0;
  list-style: none;
}
</style>

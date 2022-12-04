<script setup lang="ts">
import { ref } from "vue";
import SearchPage from "./components/SearchPage.vue";
import ChartPage from "./components/ChartPage.vue";
import { getCookie, backendDomain, getAccessToken } from "./lib";

const user = ref(getCookie("user"));

const syncStatus = ref("Sync");
const ratingCount = ref(
  parseInt(window.localStorage.getItem("stat:rating_count") || "0", 10)
);

// When this changes a search is performed. It has to be exposed at this level
// since the search box is in the header.
const search = ref("");

// This is just the model to replace `search` once a search is initiated.
const searchBox = ref("");

const view = ref("chart");

function openSearch() {
  view.value = "search";
  search.value = searchBox.value;
}

function closeSearch() {
  view.value = "chart";
}

function logout() {
  // Logout is actually not as trivial as you might think. Logout returns the
  // expired cookes, however, when running locally the backend domain is going
  // to be different so having the backend expire the cookies will be on the
  // wrong domain. For this reason, when running on local we need to just avoid
  // the real logout flow and wipe the cookies manually.
  if (backendDomain.indexOf("localhost") >= 0) {
    // These are copied from the logout handler.
    document.cookie = "bearer=; path=/; expires=Thu, 21 Sep 1979 00:00:01 UTC;";
    document.cookie =
      "refresh=; path=/; expires=Thu, 21 Sep 1979 00:00:01 UTC;";
    document.cookie = "user=; path=/; expires=Thu, 21 Sep 1979 00:00:01 UTC;";
  }

  document.location = `${backendDomain}/logout`;
}

async function syncRatings(user: string) {
  // Make sure we have a valid bearer token before we can proceed.
  await getAccessToken();

  type FetchRatingsReponseType = {
    release_group: string;
    rating: string;
  };

  let ratings: Record<string, string> = {};
  let page = 1;
  while (page > 0) {
    syncStatus.value = `${Object.keys(ratings).length} ratings...`;

    const result = await $.ajax({
      type: "GET",
      url: backendDomain + `/fetch-ratings?user=${user}&page=${page}`,
      dataType: "json",
    });
    result.ratings.forEach((r: FetchRatingsReponseType) => {
      // MusicBrainz always returns the last page even when the page
      // number goes beyond. So the only way to detect beyond the last
      // page is when we start to see the same ratings again.
      if (ratings[r.release_group]) {
        page = 0;
      }

      ratings[r.release_group] = r.rating;
    });

    if (page > 0) {
      ++page;
    }
  }

  window.localStorage.clear();
  ratingCount.value = Object.keys(ratings).length;
  window.localStorage.setItem("stat:rating_count", `${ratingCount.value}`);
  Object.keys(ratings).forEach((releaseGroup) => {
    window.localStorage.setItem(
      `release_group:${releaseGroup}:rating`,
      ratings[releaseGroup]
    );
  });

  syncStatus.value = "Sync";
}
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-3">
        <h1>ChartBrainz</h1>
      </div>
      <div class="col-9">
        <div style="text-align: right; margin-top: 10px">
          <input
            type="text"
            style="width: 200px; border: solid 1px gray"
            v-model="searchBox"
            @keyup.enter="openSearch"
          />
          &nbsp;
          <button type="button" class="btn btn-primary" @click="openSearch">
            Search
          </button>
          &nbsp;
          <a
            class="btn btn-primary"
            href="https://github.com/elliotchance/chartbrainz/issues"
            target="_blank"
          >
            Report Bug / Feature Request
          </a>
          &nbsp;
          <div class="btn-group" role="group" v-if="user">
            <button type="button" class="btn btn-outline-primary">
              {{ ratingCount }} ratings
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="() => syncRatings(user)"
            >
              {{ syncStatus }}
            </button>
          </div>
          &nbsp;
          <a
            class="btn btn-primary"
            :href="backendDomain + '/login'"
            v-if="!user"
          >
            Login
          </a>
          <span v-if="user"> Hi, {{ user }} </span>
          &nbsp;
          <a class="btn btn-primary" v-if="user" @click="logout"> Logout </a>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">&nbsp;</div>
    </div>
    <SearchPage
      :closeSearch="closeSearch"
      :user="user"
      :search="search"
      v-if="view === 'search'"
    />
    <ChartPage :user="user" v-if="view === 'chart'" />
  </div>
</template>

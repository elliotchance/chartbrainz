<script setup lang="ts">
import { ref, computed } from "vue";
import Artist from "./components/Artist.vue";
import Card from "./components/Card.vue";
import ChevronRightIcon from "./components/ChevronRightIcon.vue";
import GenreSelector from "./components/GenreSelector.vue";
import ReleaseRow from "./components/ReleaseRow.vue";
import ReleaseSearchResults from "./components/ReleaseSearchResults.vue";
import Tabs from "./components/Tabs.vue";
import MyRatings from "./components/MyRatings.vue";

const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;

const URLState = {
  set(kv: any) {
    const all = { ...URLState.getAll(), ...kv };
    document.location =
      "?" +
      Object.keys(all)
        .filter((key) => all[key] !== "")
        .map((key) => {
          return key + "=" + encodeURIComponent(all[key]);
        })
        .join("&");
  },
  get(name: string) {
    return URLState.getAll()[name] || "";
  },
  getAll() {
    const sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split("&");
    let kv: any = {};

    for (let i = 0; i < sURLVariables.length; i++) {
      const sParameterName = sURLVariables[i].split("=");
      if (sParameterName[0] !== "") {
        kv[sParameterName[0]] =
          sParameterName[1] === undefined
            ? ""
            : decodeURIComponent(sParameterName[1]);
      }
    }

    return kv;
  },
};

function getCookie(cname: string) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function pathForGenre(genres: any, genre: string): string[] {
  let path = [genre];
  let currentGenre = genre;

  // 20 is just a safety measure in case theres a circular reference.
  for (let i = 0; i < 20; i++) {
    const parents = genres.filter((g: any) => g.child_genre === currentGenre);

    if (parents.length === 0) {
      break;
    }

    const parent = parents[0].parent_genre;
    path.unshift(parent);
    currentGenre = parent;
  }

  return path;
}

const currentGenre = ref("");
const all_releases = ref([]);
const genres = ref([]);
const decade = ref(URLState.get("decade"));
const path = ref<string[]>([]);
const syncStatus = ref("Sync");
const user = ref(getCookie("user"));
const ratingCount = ref(
  parseInt(window.localStorage.getItem("stat:rating_count") || "0", 10)
);
const search = ref("");
const releaseSearchResult = ref([]);
const artistSearchResult = ref([]);
const view = ref("chart");

const rootGenres = computed(() => {
  const all = new Set([
    ...genres.value.map((genre: any) => genre.parent_genre),
    ...genres.value.map((genre: any) => genre.child_genre),
  ]);

  const children = new Set(genres.value.map((genre: any) => genre.child_genre));

  return new Set([...all].filter((element) => !children.has(element)));
});

const releases = computed(() => {
  if (decade.value !== "") {
    const minYear = parseInt(decade.value.substr(0, 4), 10);
    const maxYear = minYear + 9;

    return all_releases.value.filter(
      (r: any) => r.release_year >= minYear && r.release_year <= maxYear
    );
  }
  return all_releases.value;
});

const availableDecades = computed(() => {
  const decades = new Set(
    all_releases.value.map((r: any) => r.release_year - (r.release_year % 10))
  );
  return Array.from(decades)
    .sort()
    .reverse()
    .map((d) => `${d}s`);
});

async function doSearch() {
  const releaseResult = await $.ajax({
    type: "GET",
    url: `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(
      search.value
    )}`,
    dataType: "xml",
  });

  releaseSearchResult.value = Array.from(
    releaseResult.childNodes[0].childNodes[0].childNodes
  ).map(parseReleaseXML) as any;

  const artistResult = await $.ajax({
    type: "GET",
    url: `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(
      search.value
    )}`,
    dataType: "xml",
  });

  artistSearchResult.value = Array.from(
    artistResult.childNodes[0].childNodes[0].childNodes
  ).map((r: any) => {
    const data = {
      id: r.attributes["id"].value,
      type: r.attributes["type"]?.value,
      score: r.attributes["ns2:score"]?.value,
      name: "",
      gender: "",
      disambiguation: "",
    };
    r.childNodes.forEach((child: any) => {
      if (child.tagName === "name") {
        data.name = child.textContent;
      }
      if (child.tagName === "gender") {
        data.gender = child.textContent;
      }
      if (child.tagName === "disambiguation") {
        data.disambiguation = child.textContent;
      }
    });

    return data;
  }) as any;

  view.value = "search";
}

function closeSearch() {
  search.value = "";
  view.value = "chart";
}

function parseReleaseXML(r: any) {
  const data = {
    id: r.attributes["id"].value,
    type: r.attributes["type"]?.value,
    score: r.attributes["ns2:score"]?.value,
    title: "",
    releaseDate: "",
    artist: "",
    tags: [],
  };
  r.childNodes.forEach((child: any) => {
    if (child.tagName === "title") {
      data.title = child.textContent;
    }
    if (child.tagName === "first-release-date") {
      data.releaseDate = child.textContent;
    }
    if (child.tagName === "artist-credit") {
      // TODO: This only uses the first artist credit.
      data.artist = child.childNodes[0]?.childNodes[0]?.textContent;
    }
    if (child.tagName === "tag-list") {
      data.tags = Array.from(child.childNodes).map(
        (tag: any) => tag.childNodes[0]?.textContent
      ) as any;
    }
  });

  return data;
}

async function doArtistSearch(artistID: string) {
  const releaseResult = await $.ajax({
    type: "GET",
    url: `https://musicbrainz.org/ws/2/artist/${artistID}?inc=release-groups`,
    dataType: "xml",
  });

  releaseSearchResult.value = Array.from(
    releaseResult.getElementsByTagName("release-group")
  ).map(parseReleaseXML) as any;

  view.value = "search";
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
  $.getScript(path)
    .done((data: any) => {
      all_releases.value = JSON.parse(data);
    })
    .fail(() => {
      all_releases.value = [];
    });
}

async function syncRatings(user: string) {
  // Make sure we have a valid bearer token before we can proceed.
  await getAccessToken();

  let ratings: any = {};
  let page = 1;
  while (page > 0) {
    syncStatus.value = `${Object.keys(ratings).length} ratings...`;

    const result = await $.ajax({
      type: "GET",
      url: backendDomain + `/fetch-ratings?user=${user}&page=${page}`,
      dataType: "json",
    });
    result.ratings.forEach((r: any) => {
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

async function submitRating(releaseGroup: string, rating: number) {
  const accessToken = await getAccessToken();
  const result = await $.ajax({
    type: "POST",
    url: "https://musicbrainz.org/ws/2/rating?client=chartbrainz-1.0.0",
    contentType: "application/xml; charset=UTF-8",
    dataType: "xml",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
    data: `
          <metadata xmlns="http://musicbrainz.org/ns/mmd-2.0#">
              <release-group-list>
                  <release-group id="${releaseGroup}">
                      <user-rating>${rating}</user-rating>
                  </release-group>
              </release-group-list>
          </metadata>`,
  });

  const ratingKey = `release_group:${releaseGroup}:rating`;
  if (!window.localStorage.getItem(ratingKey)) {
    ratingCount.value++;
  } else if (rating === 0) {
    ratingCount.value--;
  }
  window.localStorage.setItem("stat:rating_count", `${ratingCount.value}`);
  window.localStorage.setItem(ratingKey, `${rating}`);
}

async function getAccessToken() {
  const accessToken = getCookie("bearer") || "";
  if (accessToken !== "") {
    return accessToken;
  }

  const resp = await $.ajax({
    type: "GET",
    url: "/refresh-token",
    dataType: "json",
  });

  document.cookie = `bearer=${resp.access_token}; Max-Age=${resp.expires_in}`;

  return resp.access_token;
}

$.getScript(`./static/data/genres.json`, (data: any) => {
  genres.value = JSON.parse(data);
  currentGenre.value = URLState.get("genre");
  if (currentGenre.value === "") {
    load(`./static/data/top.json`);
  } else {
    path.value = pathForGenre(genres.value, currentGenre.value);
    load(`./static/data/genre/${currentGenre.value.replace(/\s/g, "-")}.json`);
  }
});
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
            v-model="search"
            @keyup.enter="doSearch"
          />
          &nbsp;
          <button type="button" class="btn btn-primary" @click="doSearch">
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
          <a class="btn btn-primary" v-if="user" href="/logout"> Logout </a>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">&nbsp;</div>
    </div>
    <div class="row">
      <Tabs
        :items="{ charts: 'Charts', search: 'Search', myratings: 'My Ratings' }"
        active="charts"
      >
        <template v-slot:charts>
          <div class="container">
            <div class="row">
              <div class="col-3">
                <Card title="Filter" title-class="h5">
                  <div class="container">
                    <br />
                    <ul class="nav nav-pills">
                      <li class="nav-item">
                        <a
                          :class="'nav-link ' + (decade === '' ? 'active' : '')"
                          href="#"
                          @click="() => setDecade('')"
                          >All-time</a
                        >
                      </li>
                      <li class="nav-item" v-for="d in availableDecades">
                        <a
                          :class="'nav-link ' + (decade === d ? 'active' : '')"
                          href="#"
                          @click="() => setDecade(d)"
                          >{{ d }}</a
                        >
                      </li>
                    </ul>
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
                  <h2 v-if="releases.length === 0">No releases.</h2>
                  <table class="table" v-if="releases.length > 0">
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
                      <template v-for="(release, i) in releases">
                        <ReleaseRow
                          :release="release"
                          :number="i + 1"
                          :submit-rating="submitRating"
                          :is-logged-in="user !== ''"
                        />
                      </template>
                    </tbody>
                  </table>
                </Card>
              </div>
            </div>
          </div>
        </template>
        <template v-slot:search>
          <div class="container">
            <div class="row">
              <div class="col-6">
                <Card title="Artists" title-class="h5" :close="closeSearch">
                  <span v-if="artistSearchResult.length === 0"
                    >No artists.</span
                  >
                  <ul
                    class="list-group list-group-flush"
                    v-if="artistSearchResult.length > 0"
                  >
                    <li
                      class="list-group-item"
                      v-for="artist in artistSearchResult"
                    >
                      <span
                        class="float-end"
                        @click="() => doArtistSearch((artist as any).id)"
                      >
                        <span class="link-primary">search</span>
                        <ChevronRightIcon />
                      </span>
                      <Artist
                        :name="(artist as any).name"
                        :disambiguation="(artist as any).disambiguation"
                      />
                    </li>
                  </ul>
                </Card>
              </div>
              <div class="col-6">
                <ReleaseSearchResults
                  :release-search-result="releaseSearchResult"
                  :submit-rating="submitRating"
                  :close-search="closeSearch"
                  :user="user"
                />
              </div>
            </div>
          </div>
        </template>

        <template v-slot:myratings>
          <MyRatings></MyRatings>
        </template>
      </Tabs>
    </div>
  </div>
</template>

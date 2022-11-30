// TODO(elliotchance): Change this back to "vue" when the App no longer has any
// dynamically loaded components.
import { createApp } from "vue/dist/vue.esm-bundler.js";
import App from "./App.vue";

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

function pathForGenre(genres: any, genre: string) {
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

function ratingFor(releaseGroup: string) {
  return parseInt(
    window.localStorage[`release_group:${releaseGroup}:rating`] || "0",
    10
  );
}

const app = createApp(App);

app.component("genre-selector", {
  props: [
    "genres",
    "rootGenres",
    "setCurrentGenre",
    "path",
    "depth",
    "currentGenre",
    "setPath",
  ],
  data() {
    return {
      filter: "",
    };
  },
  template: `
        <form autocomplete="no">
          <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="Filter genres..."
              v-model="filter">
          </div>
          <div v-if="filter !== ''">
            <ul class="genre">
              <li v-for="genre in this.filteredGenres()">
                <small>
                  <tag :name="genre" @click="() => selectGenre(genre)">{{ genre }}</tag>
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
        </form>`,
  methods: {
    filteredGenres(): Array<string> {
      const all = new Set<string>([
        ...(this as any).genres.map((genre: any) => genre.parent_genre),
        ...(this as any).genres.map((genre: any) => genre.child_genre),
      ]);

      return [...all].filter((genre) => genre.indexOf((this as any).filter) >= 0).sort();
    },
    selectGenre(genre: string) {
      (this as any).filter = "";
      (this as any).setPath(pathForGenre((this as any).genres, genre));
    },
  },
});

app.component("genre-list", {
  props: ["genres", "rootGenres", "setCurrentGenre", "path", "depth"],
  template: `
        <ul class="genre">
          <li v-for="genre in rootGenres">
            <small>
              <strong v-if="genre === path[depth]">
              <tag :name="genre" @click="() => setCurrentGenre(genre, depth)">
                {{ genre }}
              </tag>
              </strong>
              <tag :name="genre" @click="() => setCurrentGenre(genre, depth)"
                v-if="depth === path.length">{{ genre }}</tag>
            </small>
    
            <genre-list :genres="genres"
              :root-genres="this.genres.filter(g => g.parent_genre === genre).map(g => g.child_genre)"
              :set-current-genre="setCurrentGenre" v-if="genre === path[depth]" :path="path" :depth="depth+1" />
          </li>
        </ul>`,
});

app.component("tag", {
  props: ["name", "cls", "link"],
  template: `<a :href="link ? 'https://musicbrainz.org/tag/' + name : '#'" :target="link ? '_blank' : ''" :class="cls">{{ name }}</a>`,
});

app.component("date", {
  props: ["year", "month", "day"],
  template:
    "{{ day ? parseInt(`${day}`, 10) : '' }} {{ monthName }} {{ year }}",
  computed: {
    monthName() {
      return [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ][parseInt(`${(this as any).month}`) - 1];
    },
  },
});

app.component("release-row", {
  props: ["release", "number", "submitRating", "isLoggedIn"],
  template: `
        <tr>
            <td>
            <img
                :src="'https://coverartarchive.org/release-group/' + release.release_group_gid + '/front-250'"
                :alt="release.release_group"
                width="100"
            />
            </td>
            <td class="h5" style="text-align: right">{{ number }}.</td>
            <td>
            <a :href="'https://musicbrainz.org/release-group/' + release.release_group_gid" target="_blank">{{ release.release_group }}</a><br />
            <strong>{{ release.artist }}</strong>
            <br />
            <small><date :year="release.release_year" :month="release.release_month" :day="release.release_day"/></small>
            <br />
            <small><raw-tags :tags="release.genres" cls="genre_tag"/></small>
            <small><raw-tags :tags="release.tags" cls="muted_tag"/></small>
            </td>
            <td style="text-align: right">
                <rating-selector :release-group="release.release_group_gid"
                :rating="ratingFor(release.release_group_gid)" :submit-rating="(releaseGroup, rating) => { this.submitRating(releaseGroup, rating).then(() => this.$forceUpdate()); }"
                v-if="isLoggedIn"/>
            </td>
            <td style="text-align: center">{{ release.rating / 20 }}</td>
            <td style="text-align: center">{{ release.rating_count }}</td>
        </tr>`,
  methods: {
    ratingFor,
  },
});

app.component("release-search-results", {
  props: ["releaseSearchResult", "submitRating"],
  data() {
    return {
      refreshKey: Math.floor(Math.random() * 1e6),
    };
  },
  template: `
        <card title="Releases" title-class="h5" :close="closeSearch">
          <span v-if="releaseSearchResult.length === 0">No releases.</span>
          <table class="table" v-if="releaseSearchResult.length > 0">
            <tbody>
              <tr v-for="release in releaseSearchResult">
                <td style="width: 110px">
                  <img
                    :src="'https://coverartarchive.org/release-group/' + release.id + '/front-250'"
                    :alt="release.release_group"
                    width="100"
                  />
                </td>
                <td>
                  <a
                    :href="'https://musicbrainz.org/release-group/' + release.id"
                    >{{ release.title }}</a
                  >
                  ({{ release.type }})<br />{{ release.artist }}<br />
                  <date
                    :year="release.releaseDate?.split('-')[0]"
                    :month="release.releaseDate?.split('-')[1]"
                    :day="release.releaseDate?.split('-')[2]"
                  v-if="release.releaseDate" /><br />{{ (release.tags || []).join(',') }}
                </td>
                <td style="text-align: right">
                  <rating-selector
                    :release-group="release.id"
                    :rating="ratingFor(release.id)"
                    :submit-rating="(releaseGroup, rating) => { this.submitRating(releaseGroup, rating).then(() => this.refreshKey = Math.floor(Math.random() * 1e6)) }"
                    v-if="user !== ''"
                    :refresh-key="refreshKey"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </card>`,
  methods: {
    ratingFor,
  },
});

app.component("raw-tags", {
  props: ["tags", "cls"],
  template: `<div>
                <span v-for="name, i in orderedTags">
                    {{ i > 0 ? ', ' : '' }}<tag :name="name" :cls="cls"/>
                </span>
            </div>`,
  computed: {
    parsedTags() {
      let parsedTags = [];
      for (const tag of ((this as any).tags || "").split(";")) {
        const [count, name] = tag.split(" ", 2);
        parsedTags.push([name, parseInt(count, 10)]);
      }

      return parsedTags;
    },
    orderedTags() {
      return (this as any).parsedTags
        .sort((a: any, b: any) => b[1] - a[1])
        .map((x: any) => x[0]);
    },
    count() {
      return ((this as any).tags || "").split(";").length;
    },
  },
});

app.component("stars", {
  props: ["rating"],
  template: `
          <span>
            <span v-if="rating === 0">no rating</span>
            <i class="fa fa-star" v-for="n in wholeStars"></i>
            <i class="fa fa-star-half-full" v-if="halfStar"></i>
            <span v-if="rating > 0">&nbsp;({{ (rating / 20).toFixed(1) }})</span>
          </span>`,
  computed: {
    wholeStars() {
      return Math.floor((this as any).rating / 20);
    },
    halfStar() {
      return (this as any).rating - Math.floor((this as any).rating / 20) * 20 >= 10;
    },
  },
});

app.component("card", {
  props: ["title", "titleClass", "close"],
  template: `
        <div class="card">
          <div :class="'card-header ' + titleClass">
            {{ title }}
            <button type="button" class="btn-close float-end" aria-label="Close" @click="close" v-if="close"></button>
          </div>
          <slot />
        </div>`,
});

app.component("artist", {
  props: ["name", "disambiguation"],
  template: `
        <span>
          {{ name }}
          <span v-if="disambiguation" class="text-muted">({{ disambiguation }})</span>
        </span>`,
});

app.component("chevron-right", {
  template: `
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-chevron-right"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
          />
        </svg>`,
});

app.component("rating-selector", {
  props: ["rating", "releaseGroup", "submitRating"],
  template: `
      <div class="dropdown">
        <button :class="'btn btn-' + (rating === 0 ? 'light' : 'secondary') + ' dropdown-toggle'"
            type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <stars :rating="rating" />
        </button>
        <ul class="dropdown-menu">
            <li v-for="rating in [0, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10]">
                <button class="dropdown-item" type="button" @click="() => this.submitRating(releaseGroup, rating)">
                    <stars :rating="rating" />
                </button>
            </li>
        </ul>
        </div>`,
});

app.mount("#app");

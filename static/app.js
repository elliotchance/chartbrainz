const app = Vue.createApp({
  data() {
    $.getScript(`./static/data/genres.json`, (data) => {
      this.genres = JSON.parse(data);
    });

    this.load(`./static/data/top.json`);

    return {
      currentGenre: "",
      all_releases: [],
      genres: [],
      decade: "",
      path: [],
      syncStatus: "Sync",
      user: getCookie("user"),
      ratingCount: parseInt(
        window.localStorage.getItem("stat:rating_count") || "0",
        10
      ),
    };
  },
  computed: {
    rootGenres() {
      const all = new Set([
        ...this.genres.map((genre) => genre.parent_genre),
        ...this.genres.map((genre) => genre.child_genre),
      ]);

      const children = new Set(this.genres.map((genre) => genre.child_genre));

      return new Set([...all].filter((element) => !children.has(element)));
    },
    releases() {
      if (this.decade !== "") {
        const minYear = parseInt(this.decade.substr(0, 4), 10);
        const maxYear = minYear + 9;

        return this.all_releases.filter(
          (r) => r.release_year >= minYear && r.release_year <= maxYear
        );
      }
      return this.all_releases;
    },
    availableDecades() {
      const decades = new Set(
        this.all_releases.map((r) => r.release_year - (r.release_year % 10))
      );
      return Array.from(decades)
        .sort()
        .reverse()
        .map((d) => `${d}s`);
    },
  },
  methods: {
    setCurrentGenre(genre, depth) {
      if (genre === "") {
        this.path = [];
      } else if (depth >= this.path.length) {
        this.path.push(genre);
      } else {
        this.path = this.path.slice(0, depth);
        this.path[depth] = genre;
      }

      if (genre === "") {
        this.load(`./static/data/top.json`);
      } else {
        this.load(`./static/data/genre/${genre}.json`);
      }
      this.currentGenre = genre;
    },
    load(path) {
      $.getScript(path)
        .done((data) => {
          this.all_releases = JSON.parse(data);
        })
        .fail(() => {
          this.all_releases = [];
        });
    },
    async syncRatings(user) {
      // Make sure we have a valid bearer token before we can proceed.
      await this.getAccessToken();

      let ratings = {};
      let page = 1;
      while (page > 0) {
        this.syncStatus = `${Object.keys(ratings).length} ratings...`;

        const result = await $.ajax({
          type: "GET",
          url: `https://chartbrainz.com/fetch-ratings?user=${user}&page=${page}`,
          dataType: "json",
        });
        result.ratings.forEach((r) => {
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
      this.ratingCount = Object.keys(ratings).length;
      window.localStorage.setItem("stat:rating_count", this.ratingCount);
      Object.keys(ratings).forEach((releaseGroup) => {
        window.localStorage.setItem(
          `release_group:${releaseGroup}:rating`,
          ratings[releaseGroup]
        );
      });

      this.syncStatus = "Sync";
    },
    async submitRating(releaseGroup, rating) {
      const accessToken = await this.getAccessToken();
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
        this.ratingCount++;
      } else if (rating === 0) {
        this.ratingCount--;
      }
      window.localStorage.setItem("stat:rating_count", `${this.ratingCount}`);
      window.localStorage.setItem(ratingKey, `${rating}`);
    },
    async getAccessToken() {
      const accessToken = getCookie("bearer") || "";
      if (accessToken !== "") {
        return accessToken;
      }

      const resp = await $.ajax({
        type: "GET",
        url: "https://chartbrainz.com/refresh-token",
        dataType: 'json',
      });

      document.cookie = `bearer=${resp.access_token}; Max-Age=${resp.expires_in}`;

      return resp.access_token;
    },
  },
});

app.component("genre-list", {
  props: ["genres", "rootGenres", "setCurrentGenre", "path", "depth"],
  template: `
    <ul style="list-style: none;">
        <li v-for="genre in rootGenres">
            <small>
                <strong v-if="genre === path[depth]">
                <tag :name="genre" @click="() => setCurrentGenre(genre, depth)">{{ genre }}</tag>
                </strong>
                <tag :name="genre" @click="() => setCurrentGenre(genre, depth)" v-if="depth === path.length">{{ genre }}</tag>
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
  template: `{{ day }} {{ monthName }} {{ year }}`,
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
      ][this.month - 1];
    },
  },
});

app.component("release-row", {
  props: ["release", "number", "submitRating"],
  template: `
    <tr>
        <td>
        <img
            :src="'https://coverartarchive.org/release-group/' + release.release_group_gid + '/front'"
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
            :rating="ratingFor(release.release_group_gid)" :submit-rating="(releaseGroup, rating) => { this.submitRating(releaseGroup, rating).then(() => this.$forceUpdate()); }"/>
        </td>
        <td style="text-align: center">{{ release.rating / 20 }}</td>
        <td style="text-align: center">{{ release.rating_count }}</td>
    </tr>`,
  methods: {
    ratingFor(releaseGroup) {
      return parseInt(
        window.localStorage[`release_group:${releaseGroup}:rating`] || "0",
        10
      );
    },
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
      for (const tag of (this.tags || "").split(";")) {
        const [count, name] = tag.split(" ", 2);
        parsedTags.push([name, parseInt(count, 10)]);
      }

      return parsedTags;
    },
    orderedTags() {
      return this.parsedTags.sort((a, b) => b[1] - a[1]).map((x) => x[0]);
    },
    count() {
      return (this.tags || "").split(";").length;
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
      </span>`,
  computed: {
    wholeStars() {
      return Math.floor(this.rating / 20);
    },
    halfStar() {
      return this.rating - Math.floor(this.rating / 20) * 20 >= 10;
    },
  },
});

app.component("rating-selector", {
  props: ["rating", "releaseGroup", "submitRating"],
  template: `
  <div class="dropdown">
    <button :class="'btn btn-' + (rating === 0 ? 'light' : 'secondary') + ' dropdown-toggle'"
        type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <stars :rating="rating">
    </button>
    <ul class="dropdown-menu">
        <li v-for="rating in [0, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10]">
            <button class="dropdown-item" type="button" @click="() => this.submitRating(releaseGroup, rating)">
                <stars :rating="rating">
            </button>
        </li>
    </ul>
    </div>`,
});

function getCookie(cname) {
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

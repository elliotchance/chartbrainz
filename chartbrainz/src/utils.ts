import { ParentChildGenre } from "./types";

export const URLState = {
  set(kv: Record<string, string>) {
    const all: Record<string, string> = { ...URLState.getAll(), ...kv };
    document.location =
      "?" +
      Object.keys(all)
        .filter((key: string) => all[key] !== "")
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
    let kv: Record<string, string> = {};

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

export function getCookie(cname: string): string {
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

export function pathForGenre(genres: ParentChildGenre[], genre: string) {
  let path = [genre];
  let currentGenre = genre;

  // 20 is just a safety measure in case theres a circular reference.
  for (let i = 0; i < 20; i++) {
    const parents = genres.filter((g) => g.child_genre === currentGenre);

    if (parents.length === 0) {
      break;
    }

    const parent = parents[0].parent_genre;
    path.unshift(parent);
    currentGenre = parent;
  }

  return path;
}

export function ratingFor(releaseGroup: string) {
  return parseInt(
    window.localStorage[`release_group:${releaseGroup}:rating`] || "0",
    10
  );
}

export const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;

export const URLState = {
  set(kv: Record<string, string>) {
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

export function getCookie(cname: string) {
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

export async function getAccessToken() {
  const accessToken = getCookie("bearer") || "";
  if (accessToken !== "") {
    return accessToken;
  }

  const resp = await $.ajax({
    type: "GET",
    url: backendDomain + "/refresh-token",
    dataType: "json",
  });

  document.cookie = `bearer=${resp.access_token}; Max-Age=${resp.expires_in}`;

  return resp.access_token;
}

export async function submitRating(
  releaseGroup: string,
  rating: number
): Promise<void> {
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

  let ratingCount = parseInt(
    window.localStorage.getItem("stat:rating_count") || "0"
  );

  const ratingKey = `release_group:${releaseGroup}:rating`;
  if (!window.localStorage.getItem(ratingKey)) {
    ratingCount++;
  } else if (rating === 0) {
    ratingCount--;
  }
  window.localStorage.setItem("stat:rating_count", `${ratingCount}`);
  window.localStorage.setItem(ratingKey, `${rating}`);
}

export function ratingFor(releaseGroup: string) {
  return parseInt(
    window.localStorage[`release_group:${releaseGroup}:rating`] || "0",
    10
  );
}

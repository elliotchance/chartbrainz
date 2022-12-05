<script setup lang="ts">
import {
  ArtistType,
  MusicBrainzXMLArtistType,
  MusicBrainzXMLReleaseType,
  ReleaseType,
} from "../types";
import ReleaseSearchResults from "./ReleaseSearchResults.vue";
import { ref } from "vue";
import ChevronRightIcon from "./ChevronRightIcon.vue";
import Artist from "./Artist.vue";
import Card from "./Card.vue";

const { closeSearch, search, user } = defineProps<{
  closeSearch: () => void;
  search: string;
  user?: string;
}>();

const releaseSearchResult = ref<Array<ReleaseType>>([]);
const artistSearchResult = ref<Array<ArtistType>>([]);

(async function doSearch() {
  const releaseResult = await $.ajax({
    type: "GET",
    url: `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(
      search
    )}`,
    dataType: "xml",
  });

  releaseSearchResult.value = Array.from(
    releaseResult.childNodes[0].childNodes[0]
      .childNodes as Array<MusicBrainzXMLReleaseType>
  ).map(parseReleaseXML);

  const artistResult = await $.ajax({
    type: "GET",
    url: `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(
      search
    )}`,
    dataType: "xml",
  });

  artistSearchResult.value = Array.from(
    artistResult.childNodes[0].childNodes[0]
      .childNodes as Array<MusicBrainzXMLArtistType>
  ).map((r: MusicBrainzXMLArtistType) => {
    const data: ArtistType = {
      id: r.attributes["id"].value,
      type: r.attributes["type"]?.value,
      score: r.attributes["ns2:score"]?.value,
      name: "",
      gender: "",
      disambiguation: "",
    };
    r.childNodes.forEach((child: ChildNode) => {
      if (child.nodeName === "name") {
        data.name = child.textContent || "";
      }
      if (child.nodeName === "gender") {
        data.gender = child.textContent || "";
      }
      if (child.nodeName === "disambiguation") {
        data.disambiguation = child.textContent || "";
      }
    });

    return data;
  });
})();

function parseReleaseXML(r: MusicBrainzXMLReleaseType): ReleaseType {
  const data: ReleaseType = {
    id: r.attributes["id"].value,
    type: r.attributes["type"]?.value,
    score: parseInt(r.attributes["ns2:score"]?.value, 10),
    title: "",
    artist: "",
    tags: [],
  };
  r.childNodes.forEach((child: ChildNode) => {
    if (child.nodeName === "title") {
      data.title = child.textContent || "";
    }
    if (child.nodeName === "first-release-date") {
      const parts = (child.textContent || "").split("-");
      data.releaseYear = parts[0] ? parseInt(parts[0], 10) : undefined;
      data.releaseMonth = parts[1] ? parseInt(parts[1], 10) : undefined;
      data.releaseDay = parts[2] ? parseInt(parts[2], 10) : undefined;
    }
    if (child.nodeName === "artist-credit") {
      // TODO: This only uses the first artist credit.
      data.artist = child.childNodes[0]?.childNodes[0]?.textContent || "";
    }
    if (child.nodeName === "tag-list") {
      data.tags = Array.from(child.childNodes).map(
        (tag: ChildNode) => tag.childNodes[0]?.textContent || ""
      );
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
    releaseResult.getElementsByTagName(
      "release-group"
    ) as Array<MusicBrainzXMLReleaseType>
  ).map(parseReleaseXML);
}
</script>

<template>
  <div class="row">
    <div class="col-6">
      <Card title="Artists" title-class="h5" :close="closeSearch">
        <span v-if="artistSearchResult.length === 0">No artists.</span>
        <ul
          class="list-group list-group-flush"
          v-if="artistSearchResult.length > 0"
        >
          <li class="list-group-item" v-for="artist in artistSearchResult">
            <span class="float-end" @click="() => doArtistSearch(artist.id)">
              <span class="link-primary">search</span>
              <ChevronRightIcon />
            </span>
            <Artist
              :name="artist.name"
              :disambiguation="artist.disambiguation"
            />
          </li>
        </ul>
      </Card>
    </div>
    <div class="col-6">
      <ReleaseSearchResults
        :release-search-result="releaseSearchResult"
        :close-search="closeSearch"
        :user="user"
      />
    </div>
  </div>
</template>

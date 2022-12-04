export type GenreParentChildType = {
  parent_genre: string;
  child_genre: string;
};

export type ReleaseType = {
  id: string;
  type?: string;
  score?: number;
  title: string;
  artist: string;
  rawTags?: string;
  releaseYear?: number;
  releaseMonth?: number;
  releaseDay?: number;
  tags?: string[];
  rating?: number;
  ratingCount?: number;
};

export type ArtistType = {
  id: string;
  name: string;
  type: string;
  score?: string,
  gender?: string,
  disambiguation?: string,
};

export type MusicBrainzXMLArtistType = Node & {
  attributes: {
    id: Attr;
    type: Attr;
    "ns2:score": Attr;
  };
};

export type MusicBrainzXMLReleaseType = Node & {
  attributes: {
    id: Attr;
    type: Attr;
    "ns2:score": Attr;
  };
};

export type SubmitRatingFn = (releaseGroup: string, rating: number) => Promise<void>;

export type ReleaseDate = {
  year?: number;
  month?: number;
  day?: number;
};

export type ChartReleaseGroupResult = {
  artist: {
    name: string;
  };
  releaseGroup: {
    id: string;
    title: string;
  };
  firstReleaseDate: ReleaseDate;
  rating: {
    average: number;
    count: number;
  };
  genres: Record<string, number>;
};

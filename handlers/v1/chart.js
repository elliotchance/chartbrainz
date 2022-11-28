export async function handler(event, context) {
  const results = [
    {
      artist: {
        name: "Pink Floyd",
      },
      releaseGroup: {
        id: "f5093c06-23e3-404f-aeaa-40f72885ee3a",
        title: "The Dark Side of the Moon",
      },
      firstReleaseDate: {
        year: 1973,
        month: 3,
        day: 24,
      },
      rating: {
        average: 95,
        count: 72,
      },
      genres: {
        "art rock": 9,
        rock: 13,
        "progressive rock": 29,
        "psychedelic rock": 10,
      },
    },
    {
      artist: {
        name: "King Crimson",
      },
      releaseGroup: {
        id: "a50636b5-5233-3329-a7f3-dba3d0e00ef7",
        title: "In the Court of the Crimson King",
      },
      firstReleaseDate: {
        year: 1969,
        month: 10,
        day: 10,
      },
      rating: {
        average: 95,
        count: 29,
      },
      genres: {
        minimalism: 1,
        "jazz fusion": 1,
        "progressive rock": 8,
        "art rock": 3,
        "psychedelic rock": 1,
        "free improvisation": 1,
        rock: 2,
      },
    },
    {
      artist: {
        name: "Tool",
      },
      releaseGroup: {
        id: "02f79295-21e1-34cc-82f2-63219eec4f0a",
        title: "Lateralus",
      },
      firstReleaseDate: {
        year: 2001,
        month: 5,
        day: 14,
      },
      rating: {
        average: 95,
        count: 28,
      },
      genres: {
        "alternative rock": 1,
        "alternative metal": 4,
        "heavy metal": 2,
        "progressive metal": 4,
        "progressive rock": 4,
        "hard rock": 2,
        rock: 6,
        metal: 4,
        "post-metal": 1,
      },
    },
    {
      artist: {
        name: "Led Zeppelin",
      },
      releaseGroup: {
        id: "2e61da88-39e9-3473-81d2-c964cb394952",
        title: "[Led Zeppelin IV]",
      },
      firstReleaseDate: {
        year: 1971,
        month: 11,
        day: 8,
      },
      rating: {
        average: 94,
        count: 31,
      },
      genres: {
        "folk rock": 3,
        "blues rock": 11,
        "classic rock": 6,
        "arena rock": 3,
        "hard rock": 20,
        "british blues": 2,
        "heavy metal": 2,
        rock: 14,
        blues: 3,
      },
    },
    {
      artist: {
        name: "Metallica",
      },
      releaseGroup: {
        id: "3d00fb45-f8ab-3436-a8e1-b4bfc4d66913",
        title: "Master of Puppets",
      },
      firstReleaseDate: {
        year: 1986,
        month: 2,
        day: 21,
      },
      rating: {
        average: 93,
        count: 58,
      },
      genres: {
        rock: 3,
        instrumental: 1,
        "hard rock": 2,
        metal: 8,
        "thrash metal": 15,
        "speed metal": 4,
        "heavy metal": 11,
      },
    },
  ];

  return {
    statusCode: 200,
    body: JSON.stringify({
      results,
    }),
  };
}

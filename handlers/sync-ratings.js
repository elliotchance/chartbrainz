import request from "request";
import { createClient } from "@supabase/supabase-js";

function req(arg) {
  return new Promise(function (resolve, reject) {
    request(arg, function (error, res, body) {
      if (!error && res.statusCode === 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

export async function handler(event, context, callback) {
  const user = event.queryStringParameters.user;
  const userId = event.queryStringParameters.userId || "";
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  let totalRatings = 0;

  let resp = await supabase
    .from("release_group_ratings")
    .delete()
    .eq("user_id", userId);

  if (resp.error) {
    throw resp.error;
  }

  for (let pageNumber = 1; pageNumber < 3; pageNumber++) {
    const url = `https://musicbrainz.org/user/${user}/ratings/release_group?page=${pageNumber}`;

    const body = await req({
      url,
      method: "GET",
    });

    const matches = [
      ...body.matchAll(
        /(\d+)%;.*?release-group\/([\da-f-]+).*?<bdi>(.*?)<\/bdi>.*?artist\/([\da-f-]+).*?<bdi>(.*?)<\/bdi>/gs
      ),
    ];

    for (const r of matches) {
      resp = await supabase.from("release_groups").upsert({
        id: r[2],
        release_title: r[3],
        artist_title: r[5],
        tags: "[]",
      });

      if (resp.error) {
        throw resp.error;
      }

      resp = await supabase.from("release_group_ratings").upsert({
        release_group_id: r[2],
        user_id: userId,
        rating: r[1],
      });

      if (resp.error) {
        throw resp.error;
      }
    }

    totalRatings += matches.length;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      count: totalRatings,
    }),
  };
}

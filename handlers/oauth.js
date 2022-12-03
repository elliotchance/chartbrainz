import request from "request";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

export function handler(event, context, callback) {
  const code = event.queryStringParameters.code;
  const clientKey = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const redirectURI = process.env.OAUTH_REDIRECT_URI;
  const domain = process.env.FRONTEND_DOMAIN;

  request(
    {
      url: "https://musicbrainz.org/oauth2/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=authorization_code&code=${encodeURIComponent(
        code
      )}&client_id=${encodeURIComponent(
        clientKey
      )}&client_secret=${encodeURIComponent(
        clientSecret
      )}&redirect_uri=${encodeURIComponent(redirectURI)}`,
    },
    function (error, response) {
      if (error) {
        callback(error);
        return;
      }

      const resp = JSON.parse(response.body);

      // Before we can save the keys, we need to pull some information.
      request(
        {
          url: "https://musicbrainz.org/oauth2/userinfo",
          method: "GET",
          headers: {
            Authorization: `Bearer ${resp.access_token}`,
          },
        },
        async function (error, response) {
          if (error) {
            callback(error);
            return;
          }

          const userInfo = JSON.parse(response.body);

          const supabaseUrl = process.env.SUPABASE_URL;
          const supabaseKey = process.env.SUPABASE_KEY;
          const supabase = createClient(supabaseUrl, supabaseKey);

          // Ignore the insert failure, so we make sure the ID doesn't change.
          await supabase
            .from("users")
            .upsert({ user: userInfo.sub, id: uuidv4() });

          callback(null, {
            statusCode: 302,
            multiValueHeaders: {
              Location: [domain],
              "Set-Cookie": [
                `bearer=${resp.access_token}; path=/; Max-Age=${resp.expires_in};`,
                `refresh=${resp.refresh_token}; path=/;`,
                `user=${userInfo.sub}; path=/;`,
              ],
            },
          });
        }
      );
    }
  );
}

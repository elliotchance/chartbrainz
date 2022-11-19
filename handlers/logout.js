var request = require("request");

module.exports.handler = (event, context, callback) => {
  let accessToken = "";
  for (const cookie of event.multiValueHeaders.cookie || []) {
    if (cookie.indexOf("bearer=") >= 0) {
      accessToken = cookie.split(";")[0].split("=")[1];
    }
  }

  const clientKey = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  request(
    {
      url: "https://musicbrainz.org/oauth2/revoke",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `token=${encodeURIComponent(
        accessToken
      )}&client_id=${encodeURIComponent(
        clientKey
      )}&client_secret=${encodeURIComponent(clientSecret)}`,
    },
    function (error) {
      if (error) {
        callback(error);
        return;
      }

      callback(null, {
        statusCode: 302,
        multiValueHeaders: {
          Location: ["https://chartbrainz.com"],
          "Set-Cookie": [
            `bearer=;expires=Thu, 21 Sep 1979 00:00:01 UTC;`,
            `refresh=;expires=Thu, 21 Sep 1979 00:00:01 UTC;`,
            `user=;expires=Thu, 21 Sep 1979 00:00:01 UTC;`,
          ],
        },
      });
    }
  );
};

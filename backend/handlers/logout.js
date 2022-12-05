const request = require("request");

module.exports.handler = (event, context, callback) => {
  let accessToken = "";
  for (const cookie of event.multiValueHeaders?.cookie || []) {
    if (cookie.indexOf("bearer=") >= 0) {
      accessToken = cookie.split(";")[0].split("=")[1];
    }
  }

  const clientKey = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const domain = process.env.FRONTEND_DOMAIN;

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
      // We should never return an error, even if something goes wrong wipe out
      // the cookies.
      callback(null, {
        statusCode: 200,
        multiValueHeaders: {
          "Set-Cookie": [
            // Note: If you modify these you will also need to update logout()
            // to handle an edge case for running locally.
            "bearer=; path=/; expires=Thu, 21 Sep 1979 00:00:01 UTC;",
            "refresh=; path=/; expires=Thu, 21 Sep 1979 00:00:01 UTC;",
            "user=; path=/; expires=Thu, 21 Sep 1979 00:00:01 UTC;",
          ],
          "Content-Type": ["text/html; charset=utf-8"],
        },
        body: `
          <!DOCTYPE html>
          <html>
          <head><meta http-equiv="refresh" content="0; url='${domain}'"></head>
          <body></body>
          </html>
        `,
      });
    }
  );
};

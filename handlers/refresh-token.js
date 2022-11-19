const request = require("request");

module.exports.handler = (event, context, callback) => {
  let refreshToken = "";
  for (const cookie of event.multiValueHeaders.cookie || []) {
    refreshToken = cookie.match(/refresh=(.*?);/)[1];
    if (refreshToken) {
        break;
    }
  }

  const clientKey = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  request(
    {
      url: "https://musicbrainz.org/oauth2/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(
        refreshToken
      )}&client_id=${encodeURIComponent(
        clientKey
      )}&client_secret=${encodeURIComponent(clientSecret)}`,
    },
    function (error, response) {
      if (error) {
        callback(error);
        return;
      }

      callback(null, {
        statusCode: 200,
        body: response.body,
      });
    }
  );
};

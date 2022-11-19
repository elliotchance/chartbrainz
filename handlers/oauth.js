const AWS = require("aws-sdk");
var request = require("request");

module.exports.handler = (event, context, callback) => {
  const code = event.queryStringParameters.code;
  const clientKey = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const redirectURI = "https://chartbrainz.com/oauth";

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
        function (error, response) {
          if (error) {
            callback(error);
            return;
          }

          const userInfo = JSON.parse(response.body);

          callback(null, {
            statusCode: 302,
            multiValueHeaders: {
              Location: ["https://chartbrainz.com"],
              "Set-Cookie": [
                `bearer=${resp.access_token}; Max-Age=${resp.expires_in}`,
                `refresh=${resp.refresh_token}`,
                `user=${userInfo.sub}`,
              ],
            },
          });
        }
      );
    }
  );
};
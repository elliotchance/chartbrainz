const request = require("request");

module.exports.handler = (event, context, callback) => {
  const user = event.queryStringParameters.user;
  const pageNumber = event.queryStringParameters.page || "1";
  const url = `https://musicbrainz.org/user/${user}/ratings/release_group?page=${pageNumber}`;

  request(
    {
      url,
      method: "GET",
    },
    function (error, _, body) {
      if (error) {
        callback(error);
        return;
      }

      const ratings = [
        ...body.matchAll(/(\d+)%;.*?release-group\/([\da-f-]+)/gs),
      ].map((r) => ({ release_group: r[2], rating: r[1] }));

      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          ratings,
        }),
      });
    }
  );
};

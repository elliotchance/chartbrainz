// This triggers the login flow which is a standard OAuth2 flow of redirecting
// them to MusicBrainz to ask for authorization, then MusicBrainz will send back
// the access token to /oauth so it can be captured and the session setup.
//
// See handlers/oauth.js for return step.

module.exports.handler = async (event, context) => {
  // We need fetch "profile" to get the MusicBrainz user name. We don't care
  // about the other profile information. All the others allow for reading and
  // writing of those entities. We don't need write access for some of these but
  // there is no way to only reqest read access.
  //
  // See https://musicbrainz.org/doc/Development/OAuth2#Scopes
  const scopes = ["profile", "rating"];
  const clientID = process.env.OAUTH_CLIENT_ID;
  const redirectURI = process.env.OAUTH_REDIRECT_URI;

  const authorizeURL =
  "https://musicbrainz.org/oauth2/authorize?response_type=code&scope=" +
  encodeURIComponent(scopes.join(' ')) +
  "&client_id=" + encodeURIComponent(clientID) + "&redirect_uri=" +
  encodeURIComponent(redirectURI) + '&access_type=offline';

  return {
    statusCode: 302,
    headers: {
        "Location": authorizeURL,
    },
  };
};

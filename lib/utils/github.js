const fetch = require('cross-fetch');

const exchangeCodeForToken = async (code) => {
  // TODO: Implement me!

  // REFERENCE DOCS:
  // https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github
  // https://github.github.io/fetch/
  // ///////////////////////////////////////

  // Make a fetch request to https://github.com/login/oauth/access_token
  const token = fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    body: { 
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET
    },
    headers: {
      Accept: 'application/json' // <- this is 
    }
  });
  return token;
};

const getGithubProfile = async (token) => {
  // TODO: Implement me!
};

module.exports = { exchangeCodeForToken, getGithubProfile };

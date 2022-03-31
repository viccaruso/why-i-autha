const { Router } = require('express');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const GithubUser = require('../models/GithubUser');
const { exchangeCodeForToken, getGithubProfile } = require('../utils/github');
const EIGHT_HOURS_IN_MS = 1000 * 60 * 60 * 8;

module.exports = Router()
  .get('/login', async (req, res) => {
    // TODO: Kick-off the github oauth flow
    // https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#1-request-a-users-github-identity
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user&redirect_uri=${process.env.REDIRECT_URI}`
    );
  })
  .get('/login/callback', async (req, res) => {
    /*
      TODO:
     * get code
     * exchange code for token
     * get info from github about user with token
     * get existing user if there is one
     * if not, create one
     * create jwt
     * set cookie and redirect
     */

    // https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github

    // code now lives in req.query
    const { code } = req.query;

    // give the code to exchangeCodeForToken function in github utils
    const token = await exchangeCodeForToken(code);

    // use this token to make another fetch request to github to get the profile information
    const info = await getGithubProfile(token);

    // now get the matching user from our table
    let user = await GithubUser.findByUsername(info.login);

    // if no user was returned above, create one
    if (!user) {
      user = await GithubUser.insert({
        username: info.login,
        avatar: info.avatar_url,
        email: info.email
      });
    }

    // bring in the jwt
    const payload = jwt.sign(user.toJSON(), process.env.JWT_SECRET, { expiresIn: '1 day' });

    // set the session cookie
    res
      .cookie(process.env.COOKIE_NAME, payload, {
        httpOnly: true,
        maxAge: EIGHT_HOURS_IN_MS
      })
      .redirect('/api/v1/github/dashboard');

  })
  .get('/dashboard', authenticate, async (req, res) => {
    // require req.user
    // get data about user and send it as json
    res.json(req.user);
  })
  .delete('/sessions', (req, res) => {
    res
      .clearCookie(process.env.COOKIE_NAME)
      .json({ success: true, message: 'Signed out successfully!' });
  });

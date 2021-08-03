const core = require("@actions/core");
const github = require("@actions/github");

const uploadAsset = async (meta, archive) => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    ? process.env.GITHUB_TOKEN
    : core.getInput("GITHUB_TOKEN");
  const octokit = github.getOctokit(GITHUB_TOKEN);

  // https://octokit.github.io/rest.js/v18#repos-upload-release-asset
  // https://www.npmjs.com/package/@octokit/request#special-cases
  try {
    const result = await octokit.request("POST " + meta.release.upload, {
      name: archive.filename,
      headers: {
        "Content-Type": "application/zip",
      },
      data: archive.data,
    });
    return result.data.browser_download_url;
  } catch (error) {
    return null;
  }
};

module.exports = uploadAsset;

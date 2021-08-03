const github = require("@actions/github");
const CONFIG = require("../config");

const octokit = github.getOctokit(CONFIG.GITHUB_TOKEN);

const restCall = async (fn) => {
  try {
    const response = await fn;
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    return null;
  }
  return null;
};

const updateManifest = async (manifest) => {
  const content = Buffer.from(JSON.stringify(manifest, null, 3)).toString(
    "base64"
  );

  const { context = {} } = github;
  const { owner, repo } = context.repo;

  const fileDetails = await restCall(
    octokit.rest.repos.getContent({ owner, repo, path: "module.json" })
  );

  const updateData = {
    owner: owner,
    repo: repo,
    path: "module.json",
    sha: fileDetails.sha,
    content: content,
    message: "FVTT Release Packager: Updating manifest",
    commiter: {
      name: "fvtt-release-packager",
      email: "fvtt-release-packager@GitHubAction",
    },
    author: {
      name: "fvtt-release-packager",
      email: "fvtt-release-packager@GitHubAction",
    },
  };

  return restCall(octokit.rest.repos.createOrUpdateFileContents(updateData));
};

module.exports = updateManifest;

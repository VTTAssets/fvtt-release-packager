const github = require("@actions/github");
const CONFIG = require("../config");

const semver = require("semver");

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

module.exports = async () => {
  const octokit = github.getOctokit(CONFIG.GITHUB_TOKEN);

  const { context = {} } = github;
  const { owner, repo } = context.repo;

  const latestRelease = await restCall(
    octokit.rest.repos.getLatestRelease({ owner, repo })
  );

  const meta = {
    repository: {
      owner: owner,
      name: repo,
      branch: latestRelease && latestRelease.target_commitish,
    },
    release: {
      version:
        latestRelease &&
        latestRelease.tag_name &&
        semver.valid(latestRelease.tag_name)
          ? semver.clean(latestRelease.tag_name)
          : null,
      tagName:
        latestRelease && latestRelease.tag_name ? latestRelease.tag_name : null,
      id: latestRelease && latestRelease.id ? latestRelease.id : null,
      upload:
        latestRelease && latestRelease.upload_url
          ? latestRelease.upload_url
          : null,
    },
  };

  if (!meta.repository.branch)
    throw "Could not retrieve repository's default branch";
  if (!latestRelease) throw "Could not retrieve latest release";
  if (!latestRelease.tag_name)
    throw "Could not retrieve version of latest release";
  if (!semver.valid(latestRelease.tag_name))
    throw (
      "Version number of latest release not a valid semver version number: " +
      latestRelease.version
    );
  if (!meta.release.version)
    throw "Could not retrieve version of latest release";

  if (!meta.release.id) throw "Could not retrieve id of latest release";

  if (!meta.release.upload)
    throw "Could not retrieve upload URL of latest release";

  return meta;
};

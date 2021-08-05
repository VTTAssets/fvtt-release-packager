const fs = require("fs");
const fetch = require("node-fetch");

const CONFIG = require("../config");

const retrieveDependencyInformation = async (dependency) => {
  if (!dependency.manifest) {
    throw (
      "No download information for dependency " + dependency.name + " given."
    );
  }

  const request = {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  };

  const response = await fetch(dependency.manifest, request);
  if (response.ok) {
    const json = await response.json();
    return { version: json.version, download: json.download };
  } else {
    return { version: null, download: null };
  }
};

const update = async (metaData) => {
  // load the local manifest
  const manifestFilename = CONFIG.GITHUB_WORKSPACE + "/module.json";

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestFilename));
  } catch (error) {
    throw "Error reading manifest from " + manifestFilename;
  }

  // update the desired version from the release
  manifest.version = metaData.release.version;

  // update the manifest path
  manifest.manifest = `https://raw.githubusercontent.com/${metaData.repository.owner}/${metaData.repository.name}/${metaData.repository.branch}/module.json`;
  manifest.download = `https://github.com/${metaData.repository.owner}/${metaData.repository.name}/releases/download/${metaData.release.tagName}/${metaData.repository.name}-v${metaData.release.version}.zip`;

  // go through all depencendies
  if (manifest.dependencies && manifest.dependencies.length) {
    manifest.dependencies = await Promise.all(
      manifest.dependencies.map(async (dependency) => {
        const update = await retrieveDependencyInformation(dependency);
        if (update.version && update.download) {
          console.log(
            `Dependency ${dependency.name}: Updated to ${update.version}@${update.download}`
          );
          return {
            name: dependency.name,
            manifest: dependency.manifest,
            version: update.version,
            download: update.download,
          };
        } else {
          console.log(
            `Dependency ${dependency.name}: No update information retrieved`
          );
          return dependency;
        }
      })
    );
  }

  // update the manifest file in the GITHUB_WORKSPACE
  fs.writeFileSync(manifestFilename, JSON.stringify(manifest, null, 3), {
    encoding: "utf-8",
  });

  return manifest;
};

module.exports = update;

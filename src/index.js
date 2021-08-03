const Repository = require("./repository/index");
const Release = require("./release/index");

/**
 * Runs at: release
 */
const main = async () => {
  const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE;

  if (!GITHUB_WORKSPACE) {
    console.log(
      "actions/checkout@v2 is required to run prior to this action, aborting."
    );
    process.exit(1);
  }

  // get metadata
  let meta;
  try {
    meta = await Repository.getMetadata();
    console.log("Meta information gathered", meta);
  } catch (error) {
    process.exit(-1);
  }

  // update the local repository with the information found
  const manifest = await Repository.update(meta);

  console.log("Manifest updated", manifest);
  const archive = await Repository.archive(manifest);
  console.log("Package archived", archive.filename);
  const assetUrl = await Release.uploadAsset(meta, archive);
  if (assetUrl === null) {
    console.log(
      `Could not create asset ${archive.filename}. Delete any existing asset with the same name before running this action again`
    );
    process.exit(4);
  }
  console.log("Asset uploaded, accessible at ", assetUrl);

  manifest.download = assetUrl;

  const result = await Repository.updateManifest(manifest);
  if (result === null) {
    console.log(
      "Package created successful, but failed to update manifest in branch " +
        meta.repository.branch +
        ", existing now."
    );
    process.exit(5);
  } else {
    console.log("Package created successful, manifest updated, existing now.");
  }
};

main();

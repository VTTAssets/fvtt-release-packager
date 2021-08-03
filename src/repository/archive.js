const fs = require("fs");
const archiver = require("archiver");
const CONFIG = require("../config");

module.exports = async (repository) => {
  return new Promise((resolve, reject) => {
    const targetFilename = `${repository.name}-v${repository.version}.zip`;
    const output = fs.createWriteStream(
      `${CONFIG.GITHUB_WORKSPACE}/${targetFilename}`
    );
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", function () {
      resolve({
        filename: targetFilename,
        data: fs.readFileSync(`${CONFIG.GITHUB_WORKSPACE}/${targetFilename}`),
      });
    });
    // pipe archive data to the file
    archive.pipe(output);

    // now add the directory contents
    archive.directory(CONFIG.GITHUB_WORKSPACE, repository.name);

    // finalize the zippping
    archive.finalize();
  });
};

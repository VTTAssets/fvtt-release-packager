const core = require("@actions/core");

module.exports = {
  GITHUB_TOKEN: core.getInput("GITHUB_TOKEN"),
  GITHUB_WORKSPACE: process.env.GITHUB_WORKSPACE,
};

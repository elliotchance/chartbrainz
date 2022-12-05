const StaticFileHandler = require("serverless-aws-static-file-handler");
const path = require("path");

const clientFilesPath = path.join(__dirname, "./../");
const fileHandler = new StaticFileHandler(clientFilesPath);

module.exports.handler = async (event, context) => {
  // An empty path occurs when testing locally. I belive API Gateway will always
  // ensure a minimum path of "/".
  if (event.path === "/" || event.path === "") {
    event.path = "index.html";
  }

  // I don't know why, but the default behavior is to only use the last path
  // component unless we intefere with this.
  event.pathParameters = null;

  return fileHandler.get(event, context);
};

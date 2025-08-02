const template = {
  manifest_version: null,
  name: "browser-messaging.test-build",
  version: "1.0.0",
  content_scripts: [
    {
      js: ["content.js"],
      matches: ["<all_urls>"]
    },
    {
      js: ["agent.js"],
      world: "MAIN",
      matches: ["<all_urls>"]
    },
  ],
  background: {
    scripts: ["bg.js"],
    service_worker: "bg.js"
  }
};

export function get(manifestVersion=3) {
  template.manifest_version = manifestVersion;
  delete template.background[(manifestVersion === 3) ? 'scripts' : 'service_worker'];
  return template;
};

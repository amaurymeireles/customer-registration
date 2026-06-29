import path from "node:path";

function quote(filePath) {
  return `"${filePath}"`;
}

function apiLintCommand(files) {
  const apiFiles = files
    .map((file) => path.relative("apps/api", file))
    .filter((file) => !file.startsWith(".."));

  if (apiFiles.length === 0) {
    return [];
  }

  return [
    `pnpm --filter @customer-registration/api exec eslint --fix ${apiFiles
      .map(quote)
      .join(" ")}`,
  ];
}

function webLintCommand(files) {
  const webFiles = files
    .map((file) => path.relative("apps/web", file))
    .filter((file) => !file.startsWith(".."));

  if (webFiles.length === 0) {
    return [];
  }

  return [
    `pnpm --filter @customer-registration/web exec next lint ${webFiles
      .map((file) => `--file ${quote(file)}`)
      .join(" ")}`,
  ];
}

export default {
  "apps/api/src/**/*.ts": apiLintCommand,
  "apps/web/**/*.{js,jsx,ts,tsx}": webLintCommand,
};

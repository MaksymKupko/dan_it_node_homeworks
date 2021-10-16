import { appendFile } from "fs";
import { mkdir, opendir, readdir, writeFile } from "fs/promises";
import path from "path";
import { createMethodFile } from "./createMethodFile";
import { createRouteDir } from "./createRouteDir";
import { createIndexTemplate } from "./templates/createIndexTemplate";

const srcDir = path.join(process.cwd(), "src");
const apiDirPath = path.join(srcDir, "api");

const checkApiDirExists = async (): Promise<boolean> => {
  const directories: string[] = await readdir(srcDir);

  return directories.includes("api");
};

(async function () {
  const apiDirExists: boolean = await checkApiDirExists();

  if (!apiDirExists) {
    await mkdir(apiDirPath);
  }
  process.chdir(apiDirPath);
  const dirCreated = await createRouteDir("dumb");

  //TODO error handler
  // if (typeof dirCreated === "string") {
  process.chdir("dumb");
  createIndexTemplate("dumb");
  // }
  // createMethodFile("get")
})();

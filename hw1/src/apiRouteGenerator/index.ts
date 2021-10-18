import Generator from "./Generator.class";
import chalk from "chalk";
const log = console.log;

(async function () {
  try {
    const test = new Generator("test");
    await test.createRouteDir();
    await test.createAllMethodsFiles();
  } catch (error) {
    log(chalk.red(error));
  }
})();

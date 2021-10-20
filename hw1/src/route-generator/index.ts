import chalk from "chalk";
import Generator from "./Generator.class";
const log = console.log;

export const start = async () => {
  try {
    const args = process.argv.splice(2);
    const [route = null, ...argMethods] = args;
    if (!route) throw new Error("You didn't specified route name argument.");

    const generator = new Generator(route, argMethods);
    await generator.setDirPaths();
    await generator.checkApiDirExists();
    await generator.createRouteDir();
    await generator.createRouteIndexFile();
    await generator.createAllMethodsFiles();
    await generator.createApiIndexFile();
    log(chalk.green.bold("Api route successfully created"));
  } catch (error) {
    log(chalk.red(error));
  }
};

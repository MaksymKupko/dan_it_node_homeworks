import Generator from "./Generator.class";
import chalk, { green } from "chalk";
const log = console.log;

export const start = async () => {
  try {
    const route = process.argv[2] || null;
    if (!route) throw new Error("You didn't specified route name argument.");

    const generator = new Generator(route);
    await generator.setDirPaths();
    await generator.createRouteDir();
    await generator.createAllMethodsFiles();
    await generator.createRouteIndexFile();
    await generator.createApiIndexFile();
    log(chalk.green.bold("Api route successfully created"));
  } catch (error) {
    log(chalk.red(error));
  }
};

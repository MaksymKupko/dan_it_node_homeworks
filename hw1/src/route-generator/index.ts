import Generator from "./Generator.class";
import chalk, { green } from "chalk";
const log = console.log;

export const start = async () => {
  const route = process.argv[2];
  try {
    const test = new Generator(route);
    await test.createRouteDir();
    await test.createAllMethodsFiles();
    await test.createRouteIndexFile();
    await test.createApiIndexFile();
    log(chalk.green.bold("Api route successfully created"));
  } catch (error) {
    log(chalk.red(error));
  }
};

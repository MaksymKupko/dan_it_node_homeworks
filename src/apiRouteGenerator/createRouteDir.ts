import chalk from "chalk";
import { mkdir } from "fs/promises";

export const createRouteDir = async (route: string): Promise<string | boolean> => {
  try {
    const path = await mkdir(route);
    console.log(path);
    return "ololo";
    // return true;
  } catch (error) {
    //  `Folder "${route}" already exists`;
    console.log(chalk.bold.red(`Folder "${route}" already exists`));
    //TODO change to false
    return !false;
  }
};

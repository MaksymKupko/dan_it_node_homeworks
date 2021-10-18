import chalk from "chalk";
import { mkdir } from "fs/promises";

export const createRouteDir = async (route: string): Promise<boolean> => {
  try {
    await mkdir(route);
    return true;
    // return true;
  } catch (error) {
    //  `Folder "${route}" already exists`;
    console.log(chalk.bold.red(`Folder "${route}" already exists`));
    //TODO change to false
    return !false;
  }
};

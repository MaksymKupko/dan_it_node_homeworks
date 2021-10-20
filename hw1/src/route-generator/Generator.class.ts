import chalk from "chalk";
import { access, appendFile, mkdir, open, readdir, writeFile } from "fs/promises";
import path from "path";

export default class Generator {
  readonly methods: string[] = ["get", "post", "put", "delete", "patch"];
  route: string;
  capRoute: string;
  srcDirPath: string;
  apiDirPath: string;
  routerDirPath: string;
  routerDirCreated: boolean;

  constructor(route: string) {
    this.route = route;
    this.capRoute = this.capitalize(this.route);
    this.srcDirPath = "";
    this.apiDirPath = "";
    this.routerDirPath = "";
    this.routerDirCreated = false;
  }

  capitalize(string: string): string {
    return `${string[0].toUpperCase()}${string.substring(1)}`;
  }

  async findPkgJson(currentDir: string): Promise<string | null> {
    let currentPath: string = currentDir;
    let initialPath: string = "";
    do {
      try {
        initialPath = currentPath;
        await access(path.join(initialPath, "package.json"));
        return initialPath;
      } catch (error) {
        process.chdir("../");
        currentPath = process.cwd();
      }
    } while (currentPath !== initialPath);
    return null;
  }

  async getRootFolderPath(): Promise<string> {
    let currentPath: string = process.cwd();
    let result: string | null = await this.findPkgJson(currentPath);

    if (!result) {
      throw new Error("Cannot find root folder of project");
    }
    return result;
  }

  async setDirPaths(): Promise<boolean> {
    try {
      const rootDirPath = await this.getRootFolderPath();
      this.srcDirPath = path.join(rootDirPath, "src");
      this.apiDirPath = path.join(this.srcDirPath, "api");
      this.routerDirPath = path.join(this.apiDirPath, this.route);
      return true;
    } catch (error) {
      throw error;
    }
  }

  protected createRouteMethodTemplate(method: string): string {
    const result = `import {Request,Response} from 'express';

export const ${method}${this.capRoute} = async (req:Request, res:Response) => {
  res.sendStatus(200);
  };
	`;

    return result;
  }

  protected createRouteIndexTemplate(): string {
    const route = this.capRoute;

    return `import { Router } from 'express';
import { get${route} } from './get';
import { post${route} } from './post';
import { patch${route} } from './patch';
import { delete${route} } from './delete';
import { put${route} } from './put';

const router = Router();

router.get('/', get${route});
router.post('/', post${route});
router.patch('/', patch${route});
router.delete('/', delete${route});
router.put('/', put${route});

export default router; 
		`;
  }

  async checkApiDirExists(): Promise<boolean> {
    const directories: string[] = await readdir(this.srcDirPath);
    if (!directories.includes("api")) {
      throw new Error("api folder doesn't exist");
    } else {
      return true;
    }
  }

  async createRouteDir(): Promise<boolean> {
    try {
      await mkdir(this.routerDirPath);
      this.routerDirCreated = true;
      return true;
    } catch (error) {
      throw new Error(`Folder ${this.route} already exists.`);
    }
  }

  async createRouteMethodFile(method: string): Promise<boolean> {
    if (!this.routerDirCreated) {
      throw new Error(`${this.route} directory is not created`);
    }

    try {
      const file = `${this.routerDirPath}/${method}.ts`;
      const data = this.createRouteMethodTemplate(method);
      await appendFile(file, data);

      return true;
    } catch (error) {
      throw new Error(`Route ${method} file was not created`);
    }
  }

  async createRouteIndexFile(): Promise<boolean> {
    if (!this.routerDirCreated) {
      throw new Error(`${this.route} directory is not created`);
    }
    try {
      const file = `${this.routerDirPath}/index.ts`;
      const data = this.createRouteIndexTemplate();
      await appendFile(file, data);

      return true;
    } catch (error) {
      throw new Error(`Route index file was not created`);
    }
  }

  async createAllMethodsFiles(): Promise<boolean> {
    try {
      process.chdir(this.routerDirPath);
      await Promise.all(this.methods.map(method => this.createRouteMethodFile(method)));
      return true;
    } catch (error) {
      throw new Error("Error during methods files creating");
    }
  }

  async createApiIndexTemplate(): Promise<string> {
    const importStr = `import ${this.route}Router from "./${this.route}/index;`;
    const appUseStr = `  app.use("/${this.route}", ${this.route}Router);`;
    try {
      process.chdir(this.apiDirPath);
      const file = await open("index.ts", "r");
      const content = await file.readFile("utf-8");
      const splitTerm = content.includes("\r\n") ? "\r\n" : "\n";
      const arr = content.split(splitTerm);
      const index = arr.findIndex(item => item == "");
      arr.splice(index, 0, importStr);
      arr.splice(-2, 0, appUseStr);
      const result = arr.join("\n");
      await file.close();
      return result;
    } catch (error) {
      console.log(error);
      throw new Error("Error during api index template creating");
    }
  }

  async createApiIndexFile(): Promise<true> {
    try {
      process.chdir(this.apiDirPath);
      // const file = await open("index.ts", "a");
      const template = await this.createApiIndexTemplate();

      await writeFile("index.ts", template);
      // await file.close();
      return true;
    } catch (error) {
      throw new Error("Error during api index file appending");
    }
  }
}

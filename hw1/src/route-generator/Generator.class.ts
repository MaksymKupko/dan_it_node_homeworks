import { access, appendFile, mkdir, open, readdir, stat, writeFile } from "fs/promises";
import path from "path";
import pluralize from "pluralize";

export default class Generator {
  readonly avalMethods: string[] = ["get", "post", "put", "delete", "patch"];
  argMethods: string[];
  route: string;
  capRoute: string;
  srcDirPath: string;
  apiDirPath: string;
  routerDirPath: string;
  routerDirCreated: boolean;

  constructor(route: string, argMethods: string[]) {
    this.argMethods = argMethods.filter(method => this.avalMethods.includes(method));
    this.route = pluralize.plural(route);
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
    const methods = this.argMethods.length ? this.argMethods : this.avalMethods;
    const importsStr = methods.map(method => `import { ${method}${route} } from './${method}';`).join("\n");
    const routerStr = methods.map(method => `router.${method}('/', ${method}${route});`).join("\n");
    return `import { Router } from 'express';
${importsStr}

const router = Router();

${routerStr}

export default router; 
		`;
  }

  async checkApiDirExists(): Promise<boolean> {
    try {
      const dirExists = await this.checkDirExist(this.srcDirPath, "api");
      if (!dirExists) {
        throw new Error(`api folder doesn't exist`);
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  async checkDirExist(p: string, dirName: string): Promise<boolean> {
    try {
      const dirContent: string[] = await readdir(p);
      if (!dirContent.includes(dirName) || !(await stat(path.join(p, dirName))).isDirectory()) {
        return false;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  async createRouteDir(): Promise<boolean> {
    try {
      const dirExists = await this.checkDirExist(this.apiDirPath, this.route);
      if (dirExists) {
        throw new Error(`${this.route} dir already exists`);
      }
      await mkdir(this.routerDirPath);
      this.routerDirCreated = true;
      return true;
    } catch (error) {
      throw error;
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
      const methods = this.argMethods.length ? this.argMethods : this.avalMethods;
      await Promise.all(methods.map(method => this.createRouteMethodFile(method)));
      return true;
    } catch (error) {
      throw new Error("Error during methods files creating");
    }
  }

  async readFile(path: string): Promise<string | boolean> {
    try {
      const file = await open(path, "r");
      const content: string = await file.readFile("utf-8");
      await file.close();
      return content;
    } catch (error) {
      return false;
    }
  }

  async createApiIndexTemplate(): Promise<string> {
    const importStr = `import ${this.route}Router from "./${this.route}/index";`;
    const appUseStr = `app.use("/${this.route}", ${this.route}Router);`;
    try {
      process.chdir(this.apiDirPath);
      const content = await this.readFile("index.ts");
      if (typeof content === "string" && content !== "") {
        const splitTerm = content.includes("\r\n") ? "\r\n" : "\n";
        const arr = content.split(splitTerm);

        const imports = arr.filter(str => str.includes("import"));
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = arr.findIndex(str => str === lastImport);
        arr.splice(lastImportIndex + 1, 0, importStr);

        const appUseStrs = arr.filter(str => str.includes("app.use("));
        const targetAppUseStr = appUseStrs[appUseStrs.length - 2];
        const targetAppUseStrIndex = arr.findIndex(str => str === targetAppUseStr);
        arr.splice(targetAppUseStrIndex + 1, 0, `  ${appUseStr}`);

        const result = arr.join("\n");
        return result;
      } else {
        const result = `import { Express, json } from 'express';
${importStr}

export const registerRouters = (app: Express) => {
	app.use(json());
	${appUseStr}
};
`;
        return result;
      }
    } catch (error) {
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

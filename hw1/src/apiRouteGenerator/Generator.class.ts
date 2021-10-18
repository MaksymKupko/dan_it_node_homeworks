import path from "path";
import { mkdir, opendir, readdir, writeFile, appendFile } from "fs/promises";

export default class Generator {
  readonly methods: string[] = ["get", "post", "put", "delete", "patch"];
  route: string;
  capRoute: string;
  srcDirPath: string;
  apiDirPath: string;
  routeDirPath: string;
  routeDirCreated: boolean;

  constructor(route: string) {
    this.route = route;
    this.capRoute = this.capitalize(this.route);
    this.srcDirPath = path.join(process.cwd(), "src");
    this.apiDirPath = path.join(this.srcDirPath, "api");
    this.routeDirPath = path.join(this.apiDirPath, this.route);
    this.routeDirCreated = false;
  }

  capitalize(string: string): string {
    return `${string[0].toUpperCase()}${string.substring(1)}`;
  }

  protected createRouteMethodTemplate(method: string): string {
    return `
		import {Request,Response} from 'express';

		export const ${method}${this.capRoute} = async (req:Request, res:Response) => {
			res.sendStatus(200);
		};
		`;
  }

  protected createRouteIndex(): string {
    const route = this.capRoute;

    return `
		import { Router } from 'express';
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
      await mkdir(this.routeDirPath);
      this.routeDirCreated = true;
      return true;
    } catch (error) {
      throw new Error(`Unable to create ${this.route} folder. Maybe it exists already.`);
    }
  }

  async createRouteMethodFile(method: string): Promise<boolean> {
    if (!this.routeDirCreated) {
      throw new Error(`${this.route} directory is not created`);
    }

    try {
      const file = `${this.routeDirPath}/${method}.ts`;
      const data = this.createRouteMethodTemplate(method);
      await appendFile(file, data);

      return true;
    } catch (error) {
      throw new Error(`Route ${method} file was not created`);
    }
  }

  async createRouteIndexFile(): Promise<boolean> {
    if (!this.routeDirCreated) {
      throw new Error(`${this.route} directory is not created`);
    }
    try {
      const file = `${this.routeDirPath}/index.ts`;
      const data = this.createRouteIndex();
      await appendFile(file, data);

      return true;
    } catch (error) {
      throw new Error(`Route index file was not created`);
    }
  }

  async createAllMethodsFiles(): Promise<boolean> {
    try {
      process.chdir(this.routeDirPath);
      await Promise.all(this.methods.map(method => this.createRouteMethodFile(method)));
      return true;
    } catch (error) {
      throw new Error("Error during methods files creating");
    }
  }
}

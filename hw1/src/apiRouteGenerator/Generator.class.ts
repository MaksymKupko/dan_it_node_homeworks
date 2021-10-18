import { capitalizeString } from "../utils/capitalizeString";

class Generator {
  readonly methods: string[] = ["get", "post", "put", "delete", "patch"];
  route: string;

  constructor(route: string) {
    this.route = route;
  }

  capitalize(string: string): string {
    return `${string[0].toUpperCase()}${string.substring(1)}`;
  }

  get routeCap() {
    return this.capitalize(this.route);
  }
}

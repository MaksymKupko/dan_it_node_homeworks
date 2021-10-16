import { capitalizeString } from "../../utils/capitalizeString";

export const createIndexTemplate = (name: string): string => {
  const capitalizedName = capitalizeString(name);

  const template = `
	import { Router } from 'express';
	import { create${capitalizedName} } from './post';
	import { get${capitalizedName}s, get${capitalizedName}ById } from './get';

	const router = Router();

	router.post('/', create${capitalizedName});
	router.get('/', get${capitalizedName}s);

	router.get('/:id', get${capitalizedName}ById);

	export default router;
	`;

  console.log(template);
  return template;
};

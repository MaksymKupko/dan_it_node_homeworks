import { capitalizeString } from "../../utils/capitalizeString";

export const createIndexTemplate = (name: string): string => {
  const routeName = capitalizeString(name);

  const template = `
	import { Router } from 'express';
	import { get${routeName} } from './get';
	import { post${routeName} } from './post';
	import { patch${routeName} } from './patch';
	import { delete${routeName} } from './delete';
	import { put${routeName} } from './put';

	const router = Router();

	router.get('/', get${routeName});
	router.post('/', post${routeName});
	router.patch('/', patch${routeName});
	router.delete('/', delete${routeName});
	router.put('/', put${routeName});


	export default router;
	`;
  return template;
};

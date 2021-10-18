# Homework 1

> Предварительные условия для проекта, в котором ваш пакет будет генерировать API

- ### Проект написан на typescript.

- ### В проекте создана папка src/api и файл src/api/index.ts

- ### В файле src/api/index.ts описана функция registerRouters

  ![src/api/index.ts](https://i.imgur.com/O0JQpoN.png)

</br>

### Вам нужно создать npm-пакет, который будет генерировать API для заданной сущности.

</br>

> ## Задание

- ### Создать проект, написать код и запушить на npm. Название пакета любое, но оно должно содержать слово `cli` - например `danit-sasha-cli` или `maybe-the-best-api-cli`

- ### Ваш пакет должен принимать один параметр - название сущности, для которой будет генерироваться API

  ![example](https://i.imgur.com/bLXFvEU.png)

<div align='center'>

## Генерация API состоит из таких действий:

 </div>
</br>

1. ### Создание новой папки для сущности в каталоге `src/api`

2. ### Создание функций-обработчиков запросов

   </br>

   > <span style="font-size:1.2em;">Шаблон функции-обработчика</span>

   ```ts
   import { Request, Response } from 'express';

   export const [get|post|put|patch|delete]+Entity = async (req: Request, res: Response) => {
     res.sendStatus(200);
   };
   ```

3. ### Создание роутера, регистрация в нём всех функций-обработчиков

   > <span style="font-size:1.2em;">Шаблон роутера</span>

   ```ts
   import { Router } from 'express';
   import { getEntity } from './get';
   import { postEntity } from './post';
   import { patchEntity } from './patch';
   import { deleteEntity } from './delete';
   import { putEntity } from './put';

   const router = Router();

   router.get('/', getEntity);
   router.post('/', postEntity);
   router.patch('/', patchEntity);
   router.delete('/', deleteEntity);
   router.put('/', putEntity);

   export default router;
   ```

4. ### Импорт роутера в файле `src/api/index.ts` и регистрация по url в методе registerRouters: ![example](https://i.imgur.com/3v3l7OB.png)

> ## Структура приложения после генерации API для сущности User

![example](https://i.imgur.com/Yd8ihnY.png)

<span style='font-style:italic;font-size:1.6em'>Для наглядного примера, установите себе мой пакет

`npm i -g api-generate-cli`

После откройте папку `express-shop`, запустите в терминале команду

`api-generate-cli` несколько раз с разными аргументами и понаблюдайте за тем, как создаются и изменяются файлы.

Ваш пакет должен делать то же самое.  
</span>

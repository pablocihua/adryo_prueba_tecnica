## Instalación
***
A continuación se muestran los archivos de ejecucion tanto para la descarga del proyecto 'prueba_tecnica', como para la instalación de librería necesarias para el funcionamiento del mismo.

```
$ git clone https://example.com
$ cd ../path/to/the/file
$ npm install
$ npm run dev
```

Nombres de variables de entorno consideradas en el archvo .env.
```
PORT
JWT_SECRET
JWT_EXPIRE
NODE_ENV
```
Información a considerar:

- Cambie el nombre de la base de datos POSTGRES así como sus credenciales de acceso a la misma. Los valores credenciales a actualizar están en el archivo ```/src/data-sources.ts```, son los utilizados para conectar con la BD y crear automaticamente las tablas previamente codificadas.

- Recuercar que la ruta de acceso a los endpoints es ```http://localhost:{numero_de_puerto}``` por default está designaod el número 3001, considere los valores que mejor se ajusten a su entorno.

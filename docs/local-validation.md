# Validación local de seguridad — Lab 3

## 1. Objetivo

Este documento recoge las pruebas que pueden ejecutarse en Windows contra la copia local de `Security_Fundamentals_Lab3`. Estas pruebas sirven para verificar el comportamiento de la aplicación y detectar errores de configuración antes del despliegue.

Las pruebas locales no demuestran que el firewall de una VM esté correctamente configurado ni que los puertos internos sean inaccesibles desde Internet.

## 2. Requisitos

- PostgreSQL instalado y en ejecución.
- Base de datos `muvautomation_lab3` inicializada con el esquema y los datos de prueba.
- API `alerts-api` ejecutándose en `http://localhost:3001`.
- Frontend, si se desea probar la integración desde el navegador, ejecutándose en `http://localhost:3000`.
- Node.js y las dependencias del proyecto instaladas.

Ejecutar desde la raíz del repositorio, salvo cuando se indique lo contrario.

## 3. Salud de la API y conectividad con PostgreSQL

Comando:

```powershell
curl.exe -i http://localhost:3001/health
```

Resultado esperado si PostgreSQL está disponible: HTTP 200 y un cuerpo JSON que indique `status: ok` y `database: ok`.

Si devuelve HTTP 503, revisar el estado de PostgreSQL, la existencia de la base de datos y las variables de entorno de la API. No incluir contraseñas en la evidencia.

## 4. Lectura de alertas

Comando:

```powershell
curl.exe -i http://localhost:3001/api/alerts
```

Resultado esperado: HTTP 200 y una respuesta JSON con las alertas de prueba.

Verificar que las descripciones tengan caracteres acentuados correctos y que la respuesta no revele credenciales ni configuración interna.

## 5. CORS: origen autorizado

Comando:

```powershell
curl.exe -i http://localhost:3001/api/alerts -H "Origin: http://localhost:3000"
```

Resultado esperado: la respuesta incluye `Access-Control-Allow-Origin: http://localhost:3000` cuando ese origen está autorizado por la configuración efectiva.

## 6. CORS: origen no autorizado

Comando:

```powershell
curl.exe -i http://localhost:3001/api/alerts -H "Origin: http://sitio-no-autorizado.example"
```

Resultado esperado: el servidor rechaza el origen no permitido. Según el middleware implementado, puede responder con HTTP 403 y un error genérico. No debe devolver `Access-Control-Allow-Origin` autorizando el origen de prueba.

Nota: `curl` no aplica las restricciones CORS del navegador. Esta prueba comprueba la respuesta del servidor; no sustituye una prueba desde el navegador.

## 7. Preflight CORS

Origen permitido:

```powershell
curl.exe -i -X OPTIONS http://localhost:3001/api/alerts -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type,Authorization"
```

Resultado esperado: una respuesta de preflight exitosa con los métodos, encabezados y origen autorizados.

Repetir con el origen no autorizado y comprobar que no se permite el origen. Registrar el código HTTP observado.

## 8. Manejo de errores

Realizar una solicitud válida a un recurso inexistente:

```powershell
curl.exe -i http://localhost:3001/ruta-que-no-existe
```

Registrar el código HTTP y comprobar que la respuesta no revele trazas de ejecución, rutas locales, contraseñas ni detalles de PostgreSQL.

No provocar errores destructivos ni enviar cargas que puedan modificar o borrar datos.

## 9. Verificación de sintaxis de la API

Desde la carpeta de la API:

```powershell
cd .\app\alerts-api
npm run check
```

Resultado esperado: el comando termina sin errores de sintaxis. Esta prueba no sustituye las pruebas funcionales.

## 10. Validación de la configuración de Nginx

Si Nginx está instalado y ejecutándose en Windows, validar la configuración usando el ejecutable y el archivo de configuración que realmente emplea esa instalación. No asumir que la configuración de Ubuntu puede cargarse sin ajustes en Windows.

Si Nginx solo se despliega en Ubuntu, esta prueba se deja pendiente para la VM.

## 11. Registro de resultados

Para cada prueba, documentar:

- Fecha y hora.
- Comando ejecutado.
- Objetivo (`localhost` y puerto).
- Código HTTP y fragmento de salida relevante.
- Resultado: PASS, FAIL o BLOCKED.
- Observaciones y corrección aplicada.

No registrar contraseñas ni secretos.

## 12. Límites de la validación local

Estas pruebas no confirman:

- Que UFW esté configurado correctamente en Ubuntu.
- Que los puertos 3000, 3001 y 5432 estén bloqueados desde una red externa.
- Que SSH esté restringido a la red administrativa.
- Que Nginx esté publicado correctamente en la VM.
- Que HTTPS esté habilitado en el despliegue.
- Que la arquitectura desplegada coincida con el diagrama.

Estos puntos requieren validación en las VM y evidencia de red.

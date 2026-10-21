# Local Validation — Security Fundamentals Lab 3

## 1. Objetivo

Documentar las pruebas locales realizadas sobre `alerts-api` para verificar la disponibilidad del servicio, la conectividad con PostgreSQL, el comportamiento de los endpoints, la configuración de CORS, las respuestas ante rutas inexistentes y la sintaxis del código.

Estas pruebas se ejecutaron en el entorno local de desarrollo de Windows. No sustituyen las pruebas de integración en máquinas virtuales, la validación de Nginx ni las pruebas desde equipos externos.

## 2. Entorno de prueba

| Elemento | Valor |
|---|---|
| Sistema operativo | Windows |
| Proyecto | Security Fundamentals Lab 3 |
| Servicio evaluado | `alerts-api` |
| Tecnología backend | Node.js y Express |
| Base de datos | PostgreSQL |
| URL local de la API | `http://localhost:3001` |
| Endpoint de salud | `/health` |
| Endpoint de alertas | `/api/alerts` |
| Origen frontend autorizado probado | `http://localhost:3000` |
| Origen no autorizado probado | `http://sitio-no-autorizado.example` |
| Directorio del backend | `app/alerts-api` |

## 3. Resumen de resultados

| ID | Prueba | Resultado observado | Estado |
|---|---|---|---|
| L-01 | Conectividad TCP con PostgreSQL | `TcpTestSucceeded: True` en el puerto 5432 | Correcta |
| L-02 | Estado de salud de la API | HTTP 200; servicio y base de datos reportados como disponibles | Correcta |
| L-03 | Consulta de alertas | HTTP 200; se devolvieron 20 alertas | Correcta |
| L-04 | CORS con origen autorizado | HTTP 200; se devolvió `Access-Control-Allow-Origin` para `http://localhost:3000` | Correcta |
| L-05 | CORS con origen no autorizado | HTTP 403; respuesta `{"error":"origin_not_allowed"}` | Correcta |
| L-06 | Solicitud CORS preflight | HTTP 204; se informaron métodos y encabezados permitidos | Correcta |
| L-07 | Solicitud a una ruta inexistente | HTTP 404; Express devolvió `Cannot GET /ruta-que-no-existe` | Correcta con observación |
| L-08 | Comprobación de sintaxis de JavaScript | `npm run check` terminó sin errores | Correcta |
| L-09 | Consistencia de encabezados de seguridad | Se observaron diferencias entre las respuestas de `/health` y de la ruta inexistente | Revisión pendiente |
| L-10 | Interfaces de escucha del puerto 3001 | El proceso PID 18836 escuchaba en `0.0.0.0:3001` y `[::]:3001` | Revisión pendiente |
| L-11 | Pruebas en máquinas virtuales y a través de Nginx | No forman parte de las pruebas locales documentadas aquí | Pendiente |

## 4. Evidencia detallada

### L-01. Conectividad con PostgreSQL

**Comando ejecutado:**

```bat
powershell -Command "Test-NetConnection localhost -Port 5432"
```

**Resultado observado:**

```text
RemoteAddress    : ::1
RemotePort       : 5432
TcpTestSucceeded : True
```

**Conclusión:**

La conexión TCP con el puerto local 5432 fue satisfactoria. Este resultado confirma que había un servicio accesible en ese puerto, pero por sí solo no demuestra que todas las credenciales, permisos o consultas de la aplicación funcionen correctamente.

**Estado:** Correcta.

### L-02. Endpoint de salud de la API

**Comando ejecutado:**

```bat
curl.exe -i http://localhost:3001/health
```

**Resultado observado:**

```http
HTTP/1.1 200 OK
```

Respuesta JSON:

```json
{
  "status": "ok",
  "service": "alerts-api",
  "database": "ok"
}
```

**Conclusión:**

La API respondió correctamente y reportó la base de datos como disponible.

**Estado:** Correcta.

### L-03. Consulta de alertas

**Comando ejecutado:**

```bat
curl.exe -i http://localhost:3001/api/alerts
```

**Resultado observado:**

```http
HTTP/1.1 200 OK
```

La respuesta JSON incluyó los parámetros de paginación:

```json
{
  "limit": 50,
  "offset": 0,
  "count": 20
}
```

La respuesta también contenía las 20 alertas devueltas por el servicio.

**Conclusión:**

El endpoint de alertas respondió correctamente en el entorno local y devolvió registros de prueba.

**Estado:** Correcta.

### L-04. CORS con origen autorizado

**Comando ejecutado:**

```bat
curl.exe -i -H "Origin: http://localhost:3000" http://localhost:3001/api/alerts
```

**Resultado observado:**

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Vary: Origin
```

**Conclusión:**

La respuesta incluyó el origen del frontend local en `Access-Control-Allow-Origin`.

**Estado:** Correcta.

### L-05. CORS con origen no autorizado

**Comando ejecutado:**

```bat
curl.exe -i -H "Origin: http://sitio-no-autorizado.example" http://localhost:3001/api/alerts
```

**Resultado observado:**

```http
HTTP/1.1 403 Forbidden
```

Respuesta JSON:

```json
{
  "error": "origin_not_allowed"
}
```

**Conclusión:**

La API rechazó la solicitud asociada con el origen no autorizado y devolvió un error específico.

**Estado:** Correcta.

**Nota de seguridad:** CORS es una política aplicada por los navegadores para controlar solicitudes entre orígenes. No reemplaza la autenticación, la autorización ni los controles de acceso del servidor.

### L-06. Solicitud CORS preflight

**Comando ejecutado:**

```bat
curl.exe -i -X OPTIONS http://localhost:3001/api/alerts -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type,Authorization"
```

**Resultado observado:**

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET,POST,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
```

**Conclusión:**

La API respondió a la solicitud preflight y anunció los métodos y encabezados permitidos para el origen autorizado.

**Estado:** Correcta.

### L-07. Ruta inexistente

**Comando ejecutado:**

```bat
curl.exe -i http://localhost:3001/ruta-que-no-existe
```

**Resultado observado:**

```http
HTTP/1.1 404 Not Found
Content-Security-Policy: default-src 'none'
X-Content-Type-Options: nosniff
Content-Type: text/html; charset=utf-8
```

El cuerpo de la respuesta contenía:

```text
Cannot GET /ruta-que-no-existe
```

**Conclusión:**

La ruta inexistente devolvió HTTP 404 y no se observó una traza de ejecución en la respuesta.

Se observó la página de error predeterminada de Express. Puede evaluarse el uso de una respuesta de error personalizada y consistente con el formato JSON de la API.

**Estado:** Correcta con observación.

### L-08. Comprobación de sintaxis de JavaScript

**Directorio de ejecución:**

```text
C:\Users\sofia\Security_Fundamentals_Lab3\app\alerts-api
```

**Comandos ejecutados:**

```bat
npm run
npm run check
```

El script `check` está definido como:

```json
{
  "check": "node --check src/index.js && node --check src/db.js && node --check src/logger.js"
}
```

**Resultado observado:**

```text
> alerts-api@1.0.0 check
> node --check src/index.js && node --check src/db.js && node --check src/logger.js
```

El comando terminó sin mensajes de error y regresó al prompt de CMD.

**Conclusión:**

Los tres archivos pasaron la comprobación de sintaxis de Node.js.

En una ejecución anterior desde la raíz del repositorio, `npm run check` falló porque ese directorio no contiene el script. La comprobación válida se realizó desde `app/alerts-api`.

**Estado:** Correcta.

### L-09. Encabezados de seguridad HTTP

**Comando ejecutado para `/health`:**

```bat
curl.exe -sS -D - -o NUL http://localhost:3001/health
```

**Resultado observado en `/health`:**

La respuesta HTTP 200 mostró encabezados como:

```http
Vary: Origin
Content-Type: application/json; charset=utf-8
```

En la salida registrada no aparecieron `Content-Security-Policy` ni `X-Content-Type-Options`.

En cambio, la respuesta de la ruta inexistente mostró:

```http
Content-Security-Policy: default-src 'none'
X-Content-Type-Options: nosniff
```

**Conclusión:**

Las salidas registradas muestran diferencias entre las cabeceras de las dos respuestas. Se debe revisar el orden y el alcance del middleware de Express y repetir las pruebas para determinar si la diferencia es intencional.

No se concluye todavía que exista una vulnerabilidad ni que falte una protección global.

**Estado:** Revisión pendiente.

### L-10. Interfaces de escucha del puerto 3001

**Comando ejecutado:**

```bat
netstat -ano | findstr :3001
```

**Resultado observado:**

```text
TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    18836
TCP    [::]:3001       [::]:0       LISTENING    18836
```

**Conclusión:**

El proceso con PID `18836` estaba escuchando en todas las interfaces IPv4 e IPv6 disponibles.

Esta salida no demuestra por sí sola que la API sea accesible desde Internet: el acceso real también depende del firewall, la configuración de red y la infraestructura.

Si Nginx debe ser el único punto de entrada público, se debe comprobar que el puerto 3001 solo sea accesible desde los componentes autorizados. La configuración adecuada depende de si Nginx y la API están en el mismo equipo, en contenedores o en hosts diferentes.

**Estado:** Revisión pendiente.

### L-11. Validación mediante Nginx y máquinas virtuales

Las pruebas anteriores se realizaron localmente contra `http://localhost:3001`.

Todavía se debe validar en el entorno previsto:

- Que Nginx sea el único punto de entrada público.
- Que el acceso directo a `alerts-api` esté restringido.
- Que el enrutamiento de `/api/` funcione como se espera.
- Que los límites de solicitudes estén activos y se comporten correctamente.
- Que las reglas del firewall permitan únicamente el tráfico necesario.
- Que las protecciones de CORS y los encabezados de seguridad se comporten correctamente detrás de Nginx.
- Que los resultados de las pruebas puedan reproducirse en las máquinas virtuales.

**Estado:** Pendiente de validación en el entorno de infraestructura.

## 5. Observaciones y acciones recomendadas

1. **Exposición de red:** identificar el proceso que escucha en el puerto 3001 y comprobar las reglas de firewall. Restringir el acceso al servicio según la arquitectura prevista.
2. **Encabezados de seguridad:** revisar el middleware y verificar la consistencia de las cabeceras en los endpoints relevantes.
3. **Errores HTTP:** considerar una respuesta JSON uniforme para las rutas inexistentes y los errores de la API.
4. **Pruebas detrás de Nginx:** validar el enrutamiento y la limitación de solicitudes en el entorno donde se desplegará la aplicación.
5. **Evidencia reproducible:** conservar los comandos y las salidas reales de las pruebas, sin sustituir resultados pendientes por resultados supuestos.
6. **Pruebas externas:** registrar por separado las verificaciones de conectividad y firewall desde otro equipo o desde las máquinas virtuales.

## 6. Limitaciones

- Las pruebas se realizaron en un entorno local de Windows.
- Las respuestas exitosas no demuestran por sí solas la seguridad completa de la API.
- La comprobación de sintaxis no sustituye las pruebas unitarias, de integración o de seguridad.
- Los resultados locales no verifican el comportamiento real del firewall, Nginx o las máquinas virtuales.
- No se documenta aquí una prueba de carga ni se afirma que la limitación de solicitudes haya sido validada.
- La disponibilidad del servicio PostgreSQL en el puerto local no demuestra que la base de datos esté protegida frente a accesos remotos no autorizados.

## 7. Conclusión

Las pruebas locales realizadas confirman que `alerts-api` responde correctamente, puede consultar las alertas, reporta la base de datos como disponible y aplica la política de CORS observada para los orígenes autorizados y no autorizados. La comprobación de sintaxis de los archivos JavaScript también terminó sin errores.

Se identificaron dos aspectos que requieren revisión adicional: las diferencias observadas en los encabezados de seguridad entre endpoints y la escucha de la API en todas las interfaces de red. Ninguno de esos resultados demuestra por sí solo una vulnerabilidad explotable; ambos requieren contrastarse con la configuración del servicio y la arquitectura prevista.

La validación de Nginx, el firewall y las máquinas virtuales permanece pendiente. Por tanto, estos resultados deben presentarse como evidencia de pruebas locales, no como una certificación de seguridad del despliegue completo.

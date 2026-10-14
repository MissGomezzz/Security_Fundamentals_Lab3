# Evidencias del retest — Lab 3

## Propósito

Esta carpeta contiene evidencias obtenidas durante la validación de los controles de seguridad de la arquitectura fortalecida.

Los archivos deben contener resultados reales. Los comandos propuestos y los resultados esperados no sustituyen la evidencia de una prueba ejecutada.

## Inventario de evidencias

| Archivo | Contenido esperado | Entorno |
|---|---|---|
| `nmap_before.txt` | Escaneo previo de puertos, si está disponible | VM / punto de observación autorizado |
| `nmap_after.txt` | Escaneo posterior comparable al previo | VM / punto de observación autorizado |
| `ufw_status_numbered.txt` | Salida de `sudo ufw status numbered` | VM Ubuntu |
| `curl_api_external.txt` | Prueba del punto de entrada de la API desde otro equipo | Equipo de prueba |
| `hidden_path.txt` | Respuesta de Nginx ante `/.git/config` | VM desplegada |
| `headers_after.txt` | Cabeceras HTTP observadas después de desplegar la configuración endurecida | Nginx desplegado |
| `local-validation.md` | Resultados de las pruebas funcionales locales | Windows local |

## Registro mínimo por prueba

Cada evidencia debe indicar:

- Fecha y hora.
- Equipo desde el que se ejecutó la prueba.
- Objetivo y puerto.
- Comando utilizado.
- Resultado observado, incluido el código HTTP o el estado del puerto cuando corresponda.
- Interpretación del resultado.
- PASS, FAIL o BLOCKED.

No incluir contraseñas, tokens, claves privadas ni datos personales.

## Interpretación de resultados

- **PASS:** el resultado observado cumple el criterio de seguridad definido.
- **FAIL:** el resultado observado no cumple el criterio y requiere investigación o corrección.
- **BLOCKED:** no se pudo ejecutar la prueba por falta de acceso, infraestructura o permisos. Debe explicarse el motivo.

Un archivo vacío no constituye evidencia. Una configuración guardada en el repositorio demuestra que existe una intención de configuración, pero no que esté desplegada ni que funcione.

## Comparación antes y después

Los escaneos deben usar objetivos, puertos y puntos de observación comparables. Documentar cualquier diferencia de alcance.

No afirmar que un puerto está cerrado universalmente si solo se comprobó desde un único equipo o una única red.

## Separación entre validación local y de VM

Las pruebas locales pueden validar respuestas de la API, CORS, sintaxis y parte de la configuración. No prueban las reglas UFW ni la exposición de servicios de la VM.

Las evidencias de red deben obtenerse de las VM y desde puntos de observación autorizados.

## Estado actual

Actualizar este apartado después de ejecutar cada prueba. No marcar una evidencia como completada hasta haber guardado el resultado real.

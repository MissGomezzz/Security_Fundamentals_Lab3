# Registro de riesgos — Laboratorio 3

| ID | Amenaza STRIDE | Descripción | Estado | Evidencia | Acción / Justificación |
|----|-----------------|-------------|--------|-----------|--------------------------|
| H1 | Information Disclosure | HTTP permite observar contenido y rutas en tránsito (PCAP) | Pendiente para Lab 4 | evidence/blue/lab3-http.pcap | Requiere HTTPS/TLS (Lab 4) |
| H2 | Information Disclosure | Headers/respuestas revelan tecnología o recursos | Mitigado | evidence/retest/headers_after.txt | server_tokens off + headers de seguridad |
| H3 | Repudiation | Sin correlación temporal, no se atribuyen solicitudes | Mitigado | evidence/blue/access_log_correlacion.txt | Correlación manual timestamp ↔ access.log |
| H4 | Tampering | Sin TLS, un intermediario podría alterar tráfico | Pendiente para Lab 4 | — | Requiere HTTPS/TLS (Lab 4) |
| H5 | (agregar) | Ruta oculta .git/config accesible | Corregido | evidence/retest/hidden_path.txt | `location ~ /\. { deny all; }` |


## Gaps de seguridad de la arquitectura actual

La evaluación inicial identificó riesgos asociados a la configuración del sitio estático. La arquitectura actual incorpora Nginx, `web-frontend`, `alerts-api` y PostgreSQL, por lo que se deben evaluar también la exposición de puertos, el acceso entre servicios, la configuración de CORS y el manejo de errores.

| Gap | Riesgo | Mejora | Arquitectura fortalecida |
|---|---|---|---|
| H6 — Exposición de puertos internos | Los puertos 3000 (frontend), 3001 (API) o 5432 (PostgreSQL) pueden ser accesibles desde redes externas, facilitando ataques directos a servicios internos. | Permitir tráfico público únicamente hacia Nginx en 80/443; limitar SSH al CIDR administrativo y bloquear el acceso externo directo a los servicios internos mediante firewall. | Nginx es la única puerta pública para HTTP/HTTPS. Frontend, API y base de datos permanecen en una zona interna restringida. |
| H7 — Acceso directo a PostgreSQL | La exposición del puerto 5432 aumenta el riesgo de intentos de acceso no autorizado, fuerza bruta y explotación de vulnerabilidades de la base de datos. | Configurar PostgreSQL para escuchar solo en localhost o en una interfaz privada cuando la topología lo requiera; restringir el puerto mediante firewall y reglas de autenticación. | PostgreSQL no tiene exposición pública y acepta conexiones únicamente desde componentes autorizados. |
| H8 — CORS demasiado permisivo | Una política CORS abierta puede permitir que sitios de terceros realicen solicitudes desde navegadores hacia la API, según las credenciales y los controles de la aplicación. | Configurar una lista explícita de orígenes permitidos y validar los métodos y encabezados necesarios. No usar `*` si se requieren credenciales. | `alerts-api` acepta solicitudes de los orígenes autorizados del frontend y rechaza los demás. |
| H9 — Mensajes de error demasiado detallados | Las respuestas que revelan excepciones, rutas internas o detalles de infraestructura pueden facilitar el reconocimiento y la explotación de fallos. | Devolver mensajes genéricos al cliente y registrar los detalles técnicos únicamente en logs internos, sin secretos ni datos sensibles. | La API separa los mensajes públicos de los diagnósticos internos. |
| H10 — Ausencia de limitación de solicitudes | Un cliente puede enviar solicitudes repetidas a Nginx o a la API, consumir recursos y degradar la disponibilidad. | Implementar `limit_req_zone` y `limit_req` en Nginx, ajustar los límites a las necesidades de la aplicación y probar que no bloqueen tráfico legítimo. | Nginx limita la frecuencia de solicitudes antes de que lleguen a los servicios internos. |
| H11 — Cifrado de transporte insuficiente | Si el tráfico sensible se transmite sin HTTPS o se permiten protocolos TLS obsoletos, puede aumentar el riesgo de interceptación. | Habilitar HTTPS, preferir TLS 1.3, admitir TLS 1.2 como mínimo y deshabilitar TLS 1.0/1.1. | Nginx termina TLS en el punto de entrada público y reenvía las solicitudes a los servicios internos según la configuración de confianza. |
| H12 — Evidencia de retest incompleta | Sin resultados comparables antes y después, no es posible demostrar que las restricciones de red y los controles de la API funcionan. | Guardar resultados reales de Nmap, estado de UFW y pruebas `curl`, con fecha, objetivo y contexto de ejecución. | La evidencia documenta la reducción de la superficie expuesta y permite repetir la validación. |

---

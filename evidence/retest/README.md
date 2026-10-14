# Evidencia de retest

Esta carpeta contiene los resultados de las pruebas de exposición de puertos y acceso directo a los servicios internos.

- `nmap_before.txt`: escaneo de puertos previo a la aplicación de controles.
- `nmap_after.txt`: escaneo equivalente después de aplicar los controles.
- `ufw_status_numbered.txt`: reglas de firewall activas en la VM.
- `curl_api_external.txt`: prueba de acceso directo al endpoint de la API desde un equipo externo.

Antes de cerrar el retest, confirmar que los resultados corresponden a la misma VM, que los comandos se ejecutaron desde la ubicación documentada y que los puertos internos no son accesibles desde redes no autorizadas.


----

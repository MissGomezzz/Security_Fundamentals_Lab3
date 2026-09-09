# Registro de riesgos — Laboratorio 3

| ID | Amenaza STRIDE | Descripción | Estado | Evidencia | Acción / Justificación |
|----|-----------------|-------------|--------|-----------|--------------------------|
| H1 | Information Disclosure | HTTP permite observar contenido y rutas en tránsito (PCAP) | Pendiente para Lab 4 | evidence/blue/lab3-http.pcap | Requiere HTTPS/TLS (Lab 4) |
| H2 | Information Disclosure | Headers/respuestas revelan tecnología o recursos | Mitigado | evidence/retest/headers_after.txt | server_tokens off + headers de seguridad |
| H3 | Repudiation | Sin correlación temporal, no se atribuyen solicitudes | Mitigado | evidence/blue/access_log_correlacion.txt | Correlación manual timestamp ↔ access.log |
| H4 | Tampering | Sin TLS, un intermediario podría alterar tráfico | Pendiente para Lab 4 | — | Requiere HTTPS/TLS (Lab 4) |
| H5 | (agregar) | Ruta oculta .git/config accesible | Corregido | evidence/retest/hidden_path.txt | `location ~ /\. { deny all; }` |

Estados posibles: **Corregido**, **Mitigado**, **Aceptado**, **Pendiente para Lab 4**.

> Completar esta tabla con al menos 4 hipótesis (mínimo exigido por la guía) y añadir
> las que surjan durante la ronda Red Team / Blue Team real en la sala de laboratorio.

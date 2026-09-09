# MuvAutomation Secure Challenge — Laboratorio 3

Aplicación web pública por HTTP (sin autenticación) para el ejercicio Red Team / Blue Team
del Laboratorio 3. Repositorio acumulativo del Secure Product Challenge (FDSI).

## Estado
- ☐ Sitio desplegado en la instancia autorizada
- ☐ DFD ligero completado
- ☐ Tabla STRIDE completada (mínimo 4 hipótesis)
- ☐ Evidencia Red Team recolectada
- ☐ Evidencia Blue Team recolectada
- ☐ Hardening aplicado y retest ejecutado
- ☐ Tag `lab-3` creado

## Arquitectura
```
Usuario/Kali → Red del laboratorio (LAB_CIDR) → Nginx (puerto 80) → /var/www/muvautomation
```
Límites de confianza: (1) entrada al servidor desde la red del laboratorio, (2) frontera
entre la red y la aplicación/archivos servidos por Nginx.

Ver `diagrams/dfd-lab3.png` para el DFD completo (agregar el diagrama del equipo).

## Variables de entorno del laboratorio
Estas se acuerdan con el docente el día del laboratorio; **no** deben quedar con valores reales
en el repo si el CIDR/IP no son de uso público autorizado permanente:

```bash
export TARGET_IP=IP_ASIGNADA
export TARGET_URL=http://$TARGET_IP
export LAB_CIDR=CIDR_AUTORIZADO
```

## Estructura del repositorio
```
muvautomation-secure-challenge/
├── app/                      # contenido servido por Nginx (index.html, public-inventory.txt)
├── nginx/                    # config base y config con hardening (paso 4 y paso 15)
├── diagrams/dfd-lab3.png     # DFD ligero (agregar en sala)
├── evidence/red/             # nmap, curl, reporte ZAP pasivo
├── evidence/blue/            # access.log/error.log recortados, PCAP filtrado
├── reports/zap-passive/      # export HTML de ZAP
├── risk-register.md
└── README.md
```

## Procedimiento de reproducción (resumen)
1. **Builder**: instalar Nginx, copiar `app/*` a `/var/www/muvautomation/`, usar
   `nginx/muvautomation.conf` como sitio inicial, habilitar y validar (`nginx -t`,
   `curl -i http://127.0.0.1/`).
2. **Firewall**: `ufw` restringido a `LAB_CIDR` en el puerto 80 + OpenSSH.
3. **Modelado**: completar DFD y tabla STRIDE (ver plantilla abajo) antes de atacar.
4. **Red Team**: `nmap -Pn -sV -p 80`, `curl -i`, `curl -I`, exploración pasiva con ZAP.
   Guardar todo en `evidence/red/`.
5. **Blue Team**: captura con `tcpdump` filtrada a puerto 80, revisión de
   `access.log`/`error.log`, regla de detección (5+ códigos 404 de la misma IP en 5 min).
   Guardar todo en `evidence/blue/`.
6. **Hardening**: aplicar `nginx/muvautomation-hardened.conf` (agrega
   `server_tokens off`, headers de seguridad, `autoindex off`, deniega rutas ocultas).
7. **Retest**: repetir exactamente las pruebas del paso 4 y comparar antes/después en
   `evidence/retest/`.
8. **Cierre**: commit + `git tag lab-3`.

> **Importante**: este laboratorio deja intencionalmente HTTP sin TLS y sin autenticación.
> Ese riesgo (H1/H4 en `risk-register.md`) se resuelve en el Laboratorio 4.

## Tabla STRIDE (plantilla — completar en clase)
| ID | STRIDE | Hipótesis técnica | Validación |
|----|--------|--------------------|------------|
| H1 | Information Disclosure | HTTP permite observar contenido y rutas en tránsito | Captura PCAP filtrada |
| H2 | Information Disclosure | Headers y respuestas revelan tecnología o recursos | `curl -I` y ZAP pasivo |
| H3 | Repudiation | Sin correlación temporal, no se atribuyen solicitudes | Comparar comando con `access.log` |
| H4 | Tampering | Sin TLS, un intermediario podría alterar tráfico (no se ejecuta MITM) | Demostrar ausencia de protección |

## Uso responsable de IA
Antes de compartir logs/PCAP con cualquier IA (incluida esta conversación), anonimizar
IP públicas, hostnames, usuarios y rutas sensibles. Ningún dato real del laboratorio debe
salir sin anonimizar. Toda conclusión generada por IA debe validarse manualmente contra
comandos, logs o PCAP reales antes de incluirla en la entrega.

## Reflexión individual
(máximo 250 palabras — agregar al final de este README o en un archivo aparte
`reflexion.md` antes de la entrega)

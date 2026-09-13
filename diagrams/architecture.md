# Diagrama de arquitectura

```mermaid
flowchart LR
    user((Usuario anónimo)) -->|HTTP plano :80| edge["Borde de red / Nginx\naccess.log + error.log"]
    edge -->|servir HTML| web["web-frontend\nExpress :3000"]
    web -->|fetch /api/*| api["alerts-api\nExpress REST :3001\napp.log JSONL"]
    api --> audit["audit-service\nmódulo de auditoría"]
    api -->|SQL| db[(PostgreSQL)]
    audit -->|SQL audit_log| db

    classDef trust fill:#f2f0e9,stroke:#b64235,color:#18231f;
    class user,edge,web,api,audit,db trust;
```

Límites de confianza: el borde de red está entre el usuario y Nginx; el borde de aplicación está entre Nginx/frontend y los servicios internos. Todos los datos y nombres son ficticios.

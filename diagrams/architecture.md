# Diagrama de arquitectura

```mermaid
flowchart LR
    %% ==== Actores ====
    redteam(("Red Team\n(atacante)")):::actor
    blueteam(("Blue Team\n(analista)")):::actor

    subgraph TB1["Zona no confiable — Internet / LAB_CIDR"]
        redteam
        blueteam
    end

    subgraph TB2["DMZ — host Ubuntu, único puerto expuesto"]
        nginx["nginx\nproxy inverso\n:80/tcp HTTP"]
    end

    subgraph TB3["Red interna — Docker, sin exposición directa a Internet"]
        web["web-frontend\nExpress :3000/tcp"]
        api["alerts-api\nREST :3001/tcp"]
        audit["audit-service\nmódulo interno de alerts-api"]
        db[("PostgreSQL :5432/tcp\ntablas: alerts, audit_log")]
    end

    %% ==== Flujos de datos principales (numerados) ====
    redteam  -->|"1 · HTTP :80\nGET/POST/PATCH sin auth"| nginx
    blueteam -->|"2 · HTTP :80\nGET/POST/PATCH sin auth"| nginx
    nginx    -->|"3 · HTTP interno :3000\nHTML/CSS/JS"| web
    web      -->|"4 · fetch /api/* :3001\nJSON sobre HTTP"| api
    api      -->|"5 · llamada interna\n(mismo proceso)"| audit
    api      -->|"6 · SQL :5432"| db
    audit    -->|"7 · INSERT audit_log\nSQL :5432"| db

    %% ==== Puntos de generación de logs ====
    accesslog[("access.log /\nerror.log")]:::logstore
    applog[("app.log\nJSONL")]:::logstore

    nginx -.->|"8 · log de cada request"| accesslog
    api   -.->|"9 · log de cada operación"| applog

    classDef actor fill:#F5C4B3,stroke:#993C1D,color:#4A1B0C;
    classDef logstore fill:#FAC775,stroke:#854F0B,color:#412402;
```

En el diagrama es posible identificar los siguientes elementos: 

- Actores.
- Componentes.
- Flujos de datos.
- Protocolo.
- Puertos.
- Almacenes de datos.
- Límites de confianza.
- Punto de generación de logs.
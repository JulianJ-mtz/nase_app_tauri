# Diagrama de Base de Datos NASE

```mermaid
erDiagram
    TEMPORADA {
        int id PK
        date fecha_inicial
        date fecha_final
        int meses
        decimal produccion_total
        datetime created_at
        datetime updated_at
    }
    
    CUADRILLA {
        int id PK
        int lider_cuadrilla
        decimal produccion_cuadrilla
        string lote
        string variedad
        string empaque
        int integrantes
        int temporada_id FK
        datetime created_at
        datetime updated_at
    }
    
    JORNALERO {
        int id PK
        string nombre
        int edad
        string estado
        date fecha_contratacion
        decimal produccion_jornalero
        int errores
        int cuadrilla_id FK
        datetime created_at
        datetime updated_at
    }
    
    PRODUCCION {
        int id PK
        date fecha
        int jornalero_id FK
        int temporada_id FK
        string lote
        decimal cantidad
        int variedad_id FK
        int tipo_empaque_id FK
        int tipo_uva_id FK
        int cliente_id FK
        datetime created_at
        datetime updated_at
    }
    
    VARIEDAD {
        int id PK
        int codigo
        string nombre
        datetime created_at
        datetime updated_at
    }
    
    TIPO_UVA {
        int id PK
        int codigo
        string nombre
        datetime created_at
        datetime updated_at
    }
    
    TIPO_EMPAQUE {
        int id PK
        int codigo
        string nombre
        datetime created_at
        datetime updated_at
    }
    
    CLIENTE {
        int id PK
        int codigo
        string nombre
        datetime created_at
        datetime updated_at
    }
    
    TEMPORADA ||--o{ CUADRILLA : "tiene"
    TEMPORADA ||--o{ PRODUCCION : "tiene"
    CUADRILLA ||--o{ JORNALERO : "tiene"
    JORNALERO ||--o{ PRODUCCION : "registra"
    VARIEDAD ||--o{ PRODUCCION : "clasifica"
    TIPO_UVA ||--o{ PRODUCCION : "clasifica"
    TIPO_EMPAQUE ||--o{ PRODUCCION : "clasifica"
    CLIENTE ||--o{ PRODUCCION : "destina"
```

## Descripción de Entidades

### TEMPORADA
Representa un período de trabajo agrícola con fechas de inicio y fin.

### CUADRILLA
Grupo de trabajadores asignados a una temporada específica.

### JORNALERO
Trabajador individual que puede pertenecer a una cuadrilla.

### PRODUCCION
Registro de la producción diaria de cada jornalero, incluyendo cantidad, tipo de uva, empaque y cliente.

### VARIEDAD
Catálogo de variedades de cultivos.

### TIPO_UVA
Catálogo de tipos de uva.

### TIPO_EMPAQUE
Catálogo de tipos de empaque para el producto.

### CLIENTE
Catálogo de clientes que reciben la producción.

## Relaciones

- Una **TEMPORADA** puede tener múltiples **CUADRILLAS** y **PRODUCCIONES**.
- Una **CUADRILLA** puede tener múltiples **JORNALEROS**.
- Un **JORNALERO** puede registrar múltiples **PRODUCCIONES**.
- Una **PRODUCCION** está asociada con una **VARIEDAD**, un **TIPO_UVA**, un **TIPO_EMPAQUE** y un **CLIENTE**. 
mod m20250526_000230_create_table_temporada;
mod m20250526_001159_create_table_cuadrilla;
mod m20250526_001923_create_table_jornalero;
mod m20250526_002315_create_table_produccion;
mod m20250528_075840_create_table_cliente;
mod m20250528_080117_create_table_tipo_uva;
mod m20250528_080238_create_table_tipo_empaque;
mod m20250528_080408_create_table_variedad;
mod m20250528_080500_update_table_produccion;
mod m20250530_203152_recreate_cuadrilla_fk;

pub use sea_orm_migration::prelude::*;

pub struct Migrator;

impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            // Primero las tablas independientes (sin foreign keys)
            Box::new(m20250526_000230_create_table_temporada::CreateTemporada),
            Box::new(m20250528_080408_create_table_variedad::CreateVariedad),
            Box::new(m20250528_080238_create_table_tipo_empaque::CreateTipoEmpaque),
            Box::new(m20250528_080117_create_table_tipo_uva::CreateTipoUva),
            Box::new(m20250528_075840_create_table_cliente::CreateCliente),
            // Luego las tablas con foreign keys simples
            Box::new(m20250526_001159_create_table_cuadrilla::CreateCuadrilla),
            Box::new(m20250526_001923_create_table_jornalero::CreateJornalero),
            
            // Tablas que dependen de las anteriores
            Box::new(m20250526_002315_create_table_produccion::CreateProduccion),
            
            // Modificaciones y actualizaciones AL FINAL
            Box::new(m20250530_203152_recreate_cuadrilla_fk::RecreateCuadrillaFk),
            Box::new(m20250528_080500_update_table_produccion::UpdateProduccion),
        ]
    }
}

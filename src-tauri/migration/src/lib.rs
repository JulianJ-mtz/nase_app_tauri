mod m20250526_000230_create_table_temporada;
mod m20250526_001159_create_table_cuadrilla;
mod m20250526_001923_create_table_jornalero;
mod m20250526_002315_create_table_produccion;
mod m20250526_002615_create_table_lider_cuadrilla;

pub use sea_orm_migration::prelude::*;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20250526_000230_create_table_temporada::CreateTemporada),
            Box::new(m20250526_001159_create_table_cuadrilla::CreateCuadrilla),
            Box::new(m20250526_001923_create_table_jornalero::CreateJornalero),
            Box::new(m20250526_002315_create_table_produccion::CreateProduccion),
            Box::new(m20250526_002615_create_table_lider_cuadrilla::CreateLiderCuadrilla),
        ]
    }
}

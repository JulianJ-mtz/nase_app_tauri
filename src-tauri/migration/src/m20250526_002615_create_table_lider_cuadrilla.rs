use crate::m20250526_001159_create_table_cuadrilla::Cuadrilla;

use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct CreateLiderCuadrilla;

#[async_trait::async_trait]
impl MigrationTrait for CreateLiderCuadrilla {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // En SQLite no podemos agregar FK después, pero podemos crear un índice
        // y manejar la validación en la aplicación
        manager
            .create_index(
                Index::create()
                    .name("idx_cuadrilla_lider")
                    .table(Cuadrilla::Table)
                    .col(Cuadrilla::LiderCuadrilla)
                    .to_owned(),
            )
            .await?;

        // // Opcional: Crear un trigger para validación (SQLite specific)
        // let sql = r#"
        // CREATE TRIGGER IF NOT EXISTS validate_cuadrilla_leader
        // BEFORE INSERT ON cuadrilla
        // WHEN NEW.lider_cuadrilla IS NOT NULL
        // BEGIN
        //     SELECT CASE
        //         WHEN (SELECT COUNT(*) FROM jornalero WHERE id = NEW.lider_cuadrilla) = 0
        //         THEN RAISE(ABORT, 'Leader must be a valid jornalero')
        //     END;
        // END;
        // "#;

        // manager.get_connection().execute_unprepared(sql).await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_index(
                Index::drop()
                    .name("idx_cuadrilla_lider")
                    .table(Cuadrilla::Table)
                    .to_owned(),
            )
            .await?;

        // let sql = "DROP TRIGGER IF EXISTS validate_cuadrilla_leader;";
        // manager.get_connection().execute_unprepared(sql).await?;

        Ok(())
    }
}

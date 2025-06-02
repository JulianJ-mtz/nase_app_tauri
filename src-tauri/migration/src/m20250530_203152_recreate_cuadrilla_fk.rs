use sea_orm_migration::prelude::*;
use sea_orm_migration::sea_orm::Statement;

#[derive(DeriveMigrationName)]
pub struct RecreateCuadrillaFk;

#[async_trait::async_trait]
impl MigrationTrait for RecreateCuadrillaFk {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        use crate::m20250526_000230_create_table_temporada::Temporada;
        use crate::m20250526_001159_create_table_cuadrilla::Cuadrilla;
        use crate::m20250526_001923_create_table_jornalero::Jornalero;
        use crate::m20250528_080408_create_table_variedad::Variedad;

        // Primero, verificar si la tabla cuadrilla ya existe y tiene datos
        let result = manager
            .get_connection()
            .query_one(Statement::from_string(
                sea_orm_migration::sea_orm::DatabaseBackend::Sqlite,
                "SELECT COUNT(*) as count FROM cuadrilla".to_owned(),
            ))
            .await?;

        let count: i64 = result
            .and_then(|row| row.try_get_by_index::<i64>(0).ok())
            .unwrap_or(0);

        let has_existing_data = count > 0;

        // Si existe y tiene datos, hacer backup
        if has_existing_data {
            // Crear tabla temporal para backup
            manager
                .get_connection()
                .execute_unprepared(
                    "CREATE TEMPORARY TABLE cuadrilla_backup AS SELECT * FROM cuadrilla",
                )
                .await
                .ok();
        }

        // Eliminar la tabla actual si existe
        manager
            .drop_table(Table::drop().table(Cuadrilla::Table).if_exists().to_owned())
            .await
            .ok();

        // Crear la nueva tabla con todas las FK
        manager
            .create_table(
                Table::create()
                    .table(Cuadrilla::Table)
                    .col(
                        ColumnDef::new(Cuadrilla::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Cuadrilla::LiderCuadrillaId).integer().null())
                    .col(
                        ColumnDef::new(Cuadrilla::Lote)
                            .string()
                            .string_len(100)
                            .not_null(),
                    )
                    .col(ColumnDef::new(Cuadrilla::VariedadId).integer().null())
                    .col(ColumnDef::new(Cuadrilla::TemporadaId).integer().null())
                    .col(
                        ColumnDef::new(Cuadrilla::CreatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Cuadrilla::UpdatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    // Ahora SÍ agregamos TODAS las FK
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_cuadrilla_lider")
                            .from(Cuadrilla::Table, Cuadrilla::LiderCuadrillaId)
                            .to(Jornalero::Table, Jornalero::Id)
                            .on_delete(ForeignKeyAction::SetNull)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_cuadrilla_variedad")
                            .from(Cuadrilla::Table, Cuadrilla::VariedadId)
                            .to(Variedad::Table, Variedad::Id)
                            .on_delete(ForeignKeyAction::Restrict)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_cuadrilla_temporada")
                            .from(Cuadrilla::Table, Cuadrilla::TemporadaId)
                            .to(Temporada::Table, Temporada::Id)
                            .on_delete(ForeignKeyAction::Restrict)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // // Restaurar datos si existían
        // if has_existing_data {
        //     manager
        //         .get_connection()
        //         .execute_unprepared(
        //             "INSERT INTO cuadrilla (id, lider_cuadrilla_id, lote, temporada_id, variedad_id, created_at, updated_at)
        //              SELECT id, lider_cuadrilla_id, lote, temporada_id, variedad_id, created_at, updated_at
        //              FROM cuadrilla_backup"
        //         )
        //         .await
        //         .ok();
        // } else {
        //     // Solo hacer seeding si no había datos previos
        //     // Seeding de 5 cuadrillas
        //     let insert_cuadrillas = Query::insert()
        //         .into_table(Cuadrilla::Table)
        //         .columns([
        //             Cuadrilla::Id,
        //             Cuadrilla::Lote,
        //             Cuadrilla::TemporadaId,
        //             Cuadrilla::VariedadId,
        //         ])
        //         .values_panic([
        //             Expr::value(1),
        //             Expr::value("Lote A"),
        //             Expr::value(1),
        //             Expr::value(1),
        //         ])
        //         .values_panic([
        //             Expr::value(2),
        //             Expr::value("Lote B"),
        //             Expr::value(2),
        //             Expr::value(2),
        //         ])
        //         .values_panic([
        //             Expr::value(3),
        //             Expr::value("Lote C"),
        //             Expr::value(3),
        //             Expr::value(3),
        //         ])
        //         .values_panic([
        //             Expr::value(4),
        //             Expr::value("Lote D"),
        //             Expr::value(4),
        //             Expr::value(4),
        //         ])
        //         .values_panic([
        //             Expr::value(5),
        //             Expr::value("Lote E"),
        //             Expr::value(5),
        //             Expr::value(5),
        //         ])
        //         .to_owned();

        //     manager.exec_stmt(insert_cuadrillas).await?;

        //     // Seeding de 5 jornaleros
        //     let insert_jornaleros = Query::insert()
        //         .into_table(Jornalero::Table)
        //         .columns([
        //             Jornalero::Id,
        //             Jornalero::Nombre,
        //             Jornalero::Edad,
        //             Jornalero::Estado,
        //             Jornalero::FechaContratacion,
        //             Jornalero::Errores,
        //             Jornalero::CuadrillaId,
        //         ])
        //         .values_panic([
        //             Expr::value(1),
        //             Expr::value("Juan Perez"),
        //             Expr::value(30),
        //             Expr::value("ACTIVO"),
        //             Expr::value("2020-01-10"),
        //             Expr::value(0),
        //             Expr::value(1),
        //         ])
        //         .values_panic([
        //             Expr::value(2),
        //             Expr::value("Maria Lopez"),
        //             Expr::value(28),
        //             Expr::value("ACTIVO"),
        //             Expr::value("2021-02-15"),
        //             Expr::value(0),
        //             Expr::value(2),
        //         ])
        //         .values_panic([
        //             Expr::value(3),
        //             Expr::value("Carlos Ruiz"),
        //             Expr::value(35),
        //             Expr::value("ACTIVO"),
        //             Expr::value("2022-03-20"),
        //             Expr::value(0),
        //             Expr::value(3),
        //         ])
        //         .values_panic([
        //             Expr::value(4),
        //             Expr::value("Ana Torres"),
        //             Expr::value(32),
        //             Expr::value("ACTIVO"),
        //             Expr::value("2023-04-25"),
        //             Expr::value(0),
        //             Expr::value(4),
        //         ])
        //         .values_panic([
        //             Expr::value(5),
        //             Expr::value("Luis Gomez"),
        //             Expr::value(29),
        //             Expr::value("ACTIVO"),
        //             Expr::value("2024-05-30"),
        //             Expr::value(0),
        //             Expr::value(5),
        //         ])
        //         .to_owned();

        //     manager.exec_stmt(insert_jornaleros).await?;

        //     // Ahora actualizar los líderes de cuadrilla
        //     for i in 1..=5 {
        //         let update_lideres = Query::update()
        //             .table(Cuadrilla::Table)
        //             .values([(Cuadrilla::LiderCuadrillaId, Expr::value(i))])
        //             .and_where(Expr::col(Cuadrilla::Id).eq(i))
        //             .to_owned();
        //         manager.exec_stmt(update_lideres).await?;
        //     }
        // }

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        use crate::m20250526_001159_create_table_cuadrilla::Cuadrilla;

        // Recrear tabla sin FK circular
        manager
            .drop_table(Table::drop().table(Cuadrilla::Table).to_owned())
            .await?;

        // Recrear tabla básica
        manager
            .create_table(
                Table::create()
                    .table(Cuadrilla::Table)
                    .col(
                        ColumnDef::new(Cuadrilla::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Cuadrilla::LiderCuadrillaId).integer().null())
                    .col(
                        ColumnDef::new(Cuadrilla::Lote)
                            .string()
                            .string_len(100)
                            .not_null(),
                    )
                    .col(ColumnDef::new(Cuadrilla::VariedadId).integer().null())
                    .col(ColumnDef::new(Cuadrilla::TemporadaId).integer().null())
                    .col(
                        ColumnDef::new(Cuadrilla::CreatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Cuadrilla::UpdatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await
    }
}

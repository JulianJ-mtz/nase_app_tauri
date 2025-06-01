use crate::m20250526_000230_create_table_temporada::Temporada;
use crate::m20250526_001159_create_table_cuadrilla::Cuadrilla;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct CreateProduccion;

#[derive(DeriveIden)]
pub enum Produccion {
    Table,
    Id,
    Fecha,
    CuadrillaId,
    TemporadaId,
    // Lote,
    Cantidad,
    CreatedAt,
    UpdatedAt,
}

#[async_trait::async_trait]
impl MigrationTrait for CreateProduccion {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Produccion::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Produccion::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Produccion::Fecha).date().not_null())
                    .col(ColumnDef::new(Produccion::CuadrillaId).integer().not_null())
                    .col(ColumnDef::new(Produccion::TemporadaId).integer().not_null())
                    // .col(
                    //     ColumnDef::new(Produccion::Lote)
                    //         .string()
                    //         .string_len(100)
                    //         .not_null(),
                    // )
                    .col(
                        ColumnDef::new(Produccion::Cantidad)
                            .decimal_len(15, 3)
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Produccion::CreatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Produccion::UpdatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_produccion_cuadrilla")
                            .from(Produccion::Table, Produccion::CuadrillaId)
                            .to(Cuadrilla::Table, Cuadrilla::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_produccion_temporada")
                            .from(Produccion::Table, Produccion::TemporadaId)
                            .to(Temporada::Table, Temporada::Id)
                            .on_delete(ForeignKeyAction::Restrict)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Crear índices para optimizar consultas
        manager
            .create_index(
                Index::create()
                    .name("idx_produccion_cuadrilla")
                    .table(Produccion::Table)
                    .col(Produccion::CuadrillaId)
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_produccion_temporada")
                    .table(Produccion::Table)
                    .col(Produccion::TemporadaId)
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_produccion_fecha")
                    .table(Produccion::Table)
                    .col(Produccion::Fecha)
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        // Índice compuesto para consultas de cuadrilla por temporada
        manager
            .create_index(
                Index::create()
                    .name("idx_produccion_cuadrilla_temporada")
                    .table(Produccion::Table)
                    .col(Produccion::CuadrillaId)
                    .col(Produccion::TemporadaId)
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        // COMENTADO: Seeding se hará después de que existan los registros padre
        /*
        let insert_producciones = Query::insert()
            .into_table(Produccion::Table)
            .columns([
                Produccion::Id,
                Produccion::Fecha,
                Produccion::CuadrillaId,
                Produccion::TemporadaId,
                Produccion::Cantidad
            ])
            .values_panic([Expr::value(1), Expr::value("2020-06-15"), Expr::value(1), Expr::value(1), Expr::value(100.0)])
            .values_panic([Expr::value(2), Expr::value("2021-07-20"), Expr::value(2), Expr::value(2), Expr::value(120.5)])
            .values_panic([Expr::value(3), Expr::value("2022-08-25"), Expr::value(3), Expr::value(3), Expr::value(110.75)])
            .values_panic([Expr::value(4), Expr::value("2023-09-10"), Expr::value(4), Expr::value(4), Expr::value(130.25)])
            .values_panic([Expr::value(5), Expr::value("2024-10-05"), Expr::value(5), Expr::value(5), Expr::value(115.0)])
            .to_owned();

        manager.exec_stmt(insert_producciones).await?;
        */

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Produccion::Table).to_owned())
            .await
    }
}

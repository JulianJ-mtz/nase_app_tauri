use crate::m20250526_000230_create_table_temporada::Temporada;
use crate::m20250526_001923_create_table_jornalero::Jornalero;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct CreateProduccion;

#[derive(DeriveIden)]
pub enum Produccion {
    Table,
    Id,
    Fecha,
    JornaleroId,
    TemporadaId,
    Lote,
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
                    .col(ColumnDef::new(Produccion::JornaleroId).integer().not_null())
                    .col(ColumnDef::new(Produccion::TemporadaId).integer().not_null())
                    .col(
                        ColumnDef::new(Produccion::Lote)
                            .string()
                            .string_len(100)
                            .not_null(),
                    )
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
                            .name("fk_produccion_jornalero")
                            .from(Produccion::Table, Produccion::JornaleroId)
                            .to(Jornalero::Table, Jornalero::Id)
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
                    .name("idx_produccion_jornalero")
                    .table(Produccion::Table)
                    .col(Produccion::JornaleroId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_produccion_temporada")
                    .table(Produccion::Table)
                    .col(Produccion::TemporadaId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_produccion_fecha")
                    .table(Produccion::Table)
                    .col(Produccion::Fecha)
                    .to_owned(),
            )
            .await?;

        // Índice compuesto para consultas de cuadrilla por temporada
        manager
            .create_index(
                Index::create()
                    .name("idx_produccion_jornalero_temporada")
                    .table(Produccion::Table)
                    .col(Produccion::JornaleroId)
                    .col(Produccion::TemporadaId)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Produccion::Table).to_owned())
            .await
    }
}

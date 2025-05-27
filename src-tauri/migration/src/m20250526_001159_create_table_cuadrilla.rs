use sea_orm_migration::prelude::*;

use crate::m20250526_000230_create_table_temporada::Temporada;

#[derive(DeriveMigrationName)]
pub struct CreateCuadrilla;

#[derive(DeriveIden)]
pub enum Cuadrilla {
    Table,
    Id,
    LiderCuadrilla,
    ProduccionCuadrilla,
    Lote,
    Variedad,
    Integrantes,
    TemporadaId,
    CreatedAt,
    UpdatedAt,
}

#[async_trait::async_trait]
impl MigrationTrait for CreateCuadrilla {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Cuadrilla::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Cuadrilla::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Cuadrilla::LiderCuadrilla).integer().null(), // Solo el campo, SIN FK constraint
                    )
                    .col(
                        ColumnDef::new(Cuadrilla::ProduccionCuadrilla)
                            .decimal_len(15, 3)
                            .default(0.0),
                    )
                    .col(
                        ColumnDef::new(Cuadrilla::Lote)
                            .string()
                            .string_len(100)
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Cuadrilla::Variedad)
                            .string()
                            .string_len(100)
                            .not_null(),
                    )
                    .col(ColumnDef::new(Cuadrilla::Integrantes).integer().default(0))
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
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Cuadrilla::Table).to_owned())
            .await
    }
}

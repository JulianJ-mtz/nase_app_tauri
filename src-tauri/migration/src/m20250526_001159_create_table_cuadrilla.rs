use crate::m20250526_000230_create_table_temporada::Temporada;
use crate::m20250528_080408_create_table_variedad::Variedad;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct CreateCuadrilla;

#[derive(DeriveIden)]
pub enum Cuadrilla {
    Table,
    Id,
    LiderCuadrillaId,
    Lote,
    TemporadaId,
    VariedadId,
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
                        ColumnDef::new(Cuadrilla::LiderCuadrillaId).integer().null(),
                        // NO agregamos la FK a Jornalero todavía
                    )
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
                    // Solo agregamos las FK que NO tienen dependencia circular
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

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Cuadrilla::Table).to_owned())
            .await
    }
}

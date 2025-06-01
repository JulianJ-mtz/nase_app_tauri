use crate::m20250526_001159_create_table_cuadrilla::Cuadrilla;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct CreateJornalero;

#[derive(DeriveIden)]
pub enum Jornalero {
    Table,
    Id,
    Nombre,
    Edad,
    Estado,
    FechaContratacion,
    Errores,
    CuadrillaId,
    CreatedAt,
    UpdatedAt,
}

#[async_trait::async_trait]
impl MigrationTrait for CreateJornalero {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Jornalero::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Jornalero::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Jornalero::Nombre)
                            .string()
                            .string_len(255)
                            .not_null(),
                    )
                    .col(ColumnDef::new(Jornalero::Edad).integer().not_null())
                    .col(
                        ColumnDef::new(Jornalero::Estado)
                            .string()
                            .string_len(50)
                            .not_null()
                            .default("ACTIVO"),
                    )
                    .col(
                        ColumnDef::new(Jornalero::FechaContratacion)
                            .date()
                            .not_null(),
                    )
                    .col(ColumnDef::new(Jornalero::Errores).integer().default(0))
                    .col(ColumnDef::new(Jornalero::CuadrillaId).integer().null())
                    .col(
                        ColumnDef::new(Jornalero::CreatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Jornalero::UpdatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_jornalero_cuadrilla")
                            .from(Jornalero::Table, Jornalero::CuadrillaId)
                            .to(Cuadrilla::Table, Cuadrilla::Id)
                            .on_delete(ForeignKeyAction::SetNull)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Crear índices con manejo de errores
        let index_result = manager
            .create_index(
                Index::create()
                    .name("idx_jornalero_cuadrilla")
                    .table(Jornalero::Table)
                    .col(Jornalero::CuadrillaId)
                    .to_owned(),
            )
            .await;

        // Ignora el error si el índice ya existe
        if let Err(e) = index_result {
            if !e.to_string().contains("already exists") {
                return Err(e);
            }
        }

        let index_result = manager
            .create_index(
                Index::create()
                    .name("idx_jornalero_estado")
                    .table(Jornalero::Table)
                    .col(Jornalero::Estado)
                    .to_owned(),
            )
            .await;

        // Ignora el error si el índice ya existe
        if let Err(e) = index_result {
            if !e.to_string().contains("already exists") {
                return Err(e);
            }
        }

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Jornalero::Table).to_owned())
            .await
    }
}

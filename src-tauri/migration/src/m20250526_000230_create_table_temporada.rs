use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct CreateTemporada;

#[derive(DeriveIden)]
pub enum Temporada {
    Table,
    Id,
    FechaInicial,
    FechaFinal,
    CreatedAt,
    UpdatedAt,
}

#[async_trait::async_trait]
impl MigrationTrait for CreateTemporada {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Temporada::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Temporada::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Temporada::FechaInicial).date().not_null())
                    .col(ColumnDef::new(Temporada::FechaFinal).date().null())
                    .col(
                        ColumnDef::new(Temporada::CreatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Temporada::UpdatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Temporada::Table).to_owned())
            .await
    }
}

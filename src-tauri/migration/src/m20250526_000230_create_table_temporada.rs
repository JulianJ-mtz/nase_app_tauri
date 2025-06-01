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
            .await?;

        // Seeding de 5 temporadas (2020-2024)
        let insert_temporadas = Query::insert()
            .into_table(Temporada::Table)
            .columns([
                Temporada::Id,
                Temporada::FechaInicial,
                Temporada::FechaFinal,
            ])
            .values_panic([
                Expr::value(1),
                Expr::value("2020-01-01"),
                Expr::value("2020-12-31"),
            ])
            .values_panic([
                Expr::value(2),
                Expr::value("2021-01-01"),
                Expr::value("2021-12-31"),
            ])
            .values_panic([
                Expr::value(3),
                Expr::value("2022-01-01"),
                Expr::value("2022-12-31"),
            ])
            .values_panic([
                Expr::value(4),
                Expr::value("2023-01-01"),
                Expr::value("2023-12-31"),
            ])
            .values_panic([
                Expr::value(5),
                Expr::value("2024-01-01"),
                Expr::value("2024-12-31"),
            ])
            .to_owned();

        manager.exec_stmt(insert_temporadas).await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Delete related records in proper order (respecting foreign key constraints)
        // First delete from produccion (if it references temporada)
        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("produccion"))
                    .to_owned(),
            )
            .await
            .ok(); // Use .ok() to ignore errors if table doesn't exist yet

        // Then delete from cuadrilla (since it references temporada)
        manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("cuadrilla"))
                    .to_owned(),
            )
            .await
            .ok(); // Use .ok() to ignore errors if table doesn't exist yet

        // Finally drop the temporada table
        manager
            .drop_table(Table::drop().table(Temporada::Table).to_owned())
            .await
    }

    // async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    //     manager
    //         .drop_table(Table::drop().table(Temporada::Table).to_owned())
    //         .await
    // }
    
}

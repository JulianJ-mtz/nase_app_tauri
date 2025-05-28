use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct CreateTipoUva;

#[derive(DeriveIden)]
pub enum TipoUva {
    Table,
    Id,
    Codigo,
    Nombre,
    CreatedAt,
    UpdatedAt,
}

#[async_trait::async_trait]
impl MigrationTrait for CreateTipoUva {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(TipoUva::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(TipoUva::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(TipoUva::Codigo)
                            .integer()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(TipoUva::Nombre)
                            .string()
                            .string_len(100)
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TipoUva::CreatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(TipoUva::UpdatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // Insert grape types from the image
        let insert_tipos = Query::insert()
            .into_table(TipoUva::Table)
            .columns([TipoUva::Codigo, TipoUva::Nombre])
            .values_panic([Expr::value(1), Expr::value("Convencional")])
            .values_panic([Expr::value(2), Expr::value("Orgánico")])
            .to_owned();

        manager.exec_stmt(insert_tipos).await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(TipoUva::Table).to_owned())
            .await
    }
}
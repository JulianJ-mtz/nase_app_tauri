use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct CreateCliente;

#[derive(DeriveIden)]
pub enum Cliente {
    Table,
    Id,
    Codigo,
    Nombre,
    CreatedAt,
    UpdatedAt,
}

#[async_trait::async_trait]
impl MigrationTrait for CreateCliente {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Cliente::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Cliente::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Cliente::Codigo)
                            .integer()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(Cliente::Nombre)
                            .string()
                            .string_len(100)
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Cliente::CreatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Cliente::UpdatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // Insert clients from the image
        let insert_clientes = Query::insert()
            .into_table(Cliente::Table)
            .columns([Cliente::Codigo, Cliente::Nombre])
            .values_panic([Expr::value(1), Expr::value("Masters Touch")])
            .values_panic([Expr::value(2), Expr::value("Molina")])
            .values_panic([Expr::value(3), Expr::value("Pandol")])
            .values_panic([Expr::value(4), Expr::value("Sunfresh")])
            .values_panic([Expr::value(5), Expr::value("Pacific Trellis")])
            .values_panic([Expr::value(6), Expr::value("Oppy")])
            .values_panic([Expr::value(7), Expr::value("Otros")])
            .to_owned();

        manager.exec_stmt(insert_clientes).await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Cliente::Table).to_owned())
            .await
    }
}
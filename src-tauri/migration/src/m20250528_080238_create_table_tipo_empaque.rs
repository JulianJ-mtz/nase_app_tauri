use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct CreateTipoEmpaque;

#[derive(DeriveIden)]
pub enum TipoEmpaque {
    Table,
    Id,
    Codigo,
    Nombre,
    CreatedAt,
    UpdatedAt,
}

#[async_trait::async_trait]
impl MigrationTrait for CreateTipoEmpaque {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(TipoEmpaque::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(TipoEmpaque::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(TipoEmpaque::Codigo)
                            .integer()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(TipoEmpaque::Nombre)
                            .string()
                            .string_len(100)
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(TipoEmpaque::CreatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(TipoEmpaque::UpdatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // Insert packaging types from the image
        let insert_empaques = Query::insert()
            .into_table(TipoEmpaque::Table)
            .columns([TipoEmpaque::Codigo, TipoEmpaque::Nombre])
            .values_panic([Expr::value(1), Expr::value("Bolsa 9x2")])
            .values_panic([Expr::value(2), Expr::value("Bolsa 10x1.5")])
            .values_panic([Expr::value(3), Expr::value("Bolsa 10x2")])
            .values_panic([Expr::value(4), Expr::value("Clam 6x3")])
            .values_panic([Expr::value(5), Expr::value("Clam 8x2")])
            .values_panic([Expr::value(6), Expr::value("Clam 10x2")])
            .values_panic([Expr::value(7), Expr::value("Otro")])
            .to_owned();

        manager.exec_stmt(insert_empaques).await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(TipoEmpaque::Table).to_owned())
            .await
    }
}
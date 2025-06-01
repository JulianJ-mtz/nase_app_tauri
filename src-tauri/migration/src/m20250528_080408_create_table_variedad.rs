use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct CreateVariedad;

#[derive(DeriveIden)]
pub enum Variedad {
    Table,
    Id,
    Codigo,
    Nombre,
    CreatedAt,
    UpdatedAt,
}

#[async_trait::async_trait]
impl MigrationTrait for CreateVariedad {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Variedad::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Variedad::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Variedad::Codigo)
                            .integer()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(Variedad::Nombre)
                            .string()
                            .string_len(100)
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(Variedad::CreatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Variedad::UpdatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await?;

        // Insert varieties from the image
        let insert_varieties = Query::insert()
            .into_table(Variedad::Table)
            .columns([Variedad::Codigo, Variedad::Nombre])
            .values_panic([Expr::value(1), Expr::value("Flame")])
            .values_panic([Expr::value(2), Expr::value("Early Sweet")])
            .values_panic([Expr::value(3), Expr::value("Perlette")])
            .values_panic([Expr::value(4), Expr::value("Candy Snaps")])
            .values_panic([Expr::value(5), Expr::value("Summer Royal")])
            .values_panic([Expr::value(6), Expr::value("Sweet Globe")])
            .values_panic([Expr::value(7), Expr::value("Sweet Celebration")])
            .to_owned();

        manager.exec_stmt(insert_varieties).await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Delete all records from variedad table before dropping it
        manager
            .exec_stmt(Query::delete().from_table(Variedad::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Variedad::Table).to_owned())
            .await
    }

    // async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
    //     manager
    //         .drop_table(Table::drop().table(Variedad::Table).to_owned())
    //         .await
    // }
}

use sea_orm_migration::{prelude::*};

#[derive(Iden)]
enum Jornalero {
    Table,
    Id,
    Nombre,
    Edad,
    Produccion,
    Errores,
    Activo,
}

#[derive(DeriveMigrationName)] 
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts

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
                    .col(ColumnDef::new(Jornalero::Nombre).string().not_null())
                    .col(ColumnDef::new(Jornalero::Edad).integer().not_null())
                    .col(ColumnDef::new(Jornalero::Produccion).integer())
                    .col(ColumnDef::new(Jornalero::Errores).integer().not_null())
                    .col(ColumnDef::new(Jornalero::Activo).boolean())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Replace the sample below with your own migration scripts

        manager
            .drop_table(Table::drop().table(Jornalero::Table).to_owned())
            .await
    }
}

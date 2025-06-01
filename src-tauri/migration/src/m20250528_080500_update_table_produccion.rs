use crate::m20250526_002315_create_table_produccion::Produccion;

use sea_orm_migration::prelude::*;
// use sea_orm_migration::sea_query::Iden;

#[derive(DeriveMigrationName)]
pub struct UpdateProduccion;

#[derive(DeriveIden)]
pub enum NewColumns {
    // VariedadId,
    TipoEmpaqueId,
    TipoUvaId,
    ClienteId,
}

#[async_trait::async_trait]
impl MigrationTrait for UpdateProduccion {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Agregar nuevas columnas una por una para compatibilidad con SQLite
        // manager
        //     .alter_table(
        //         Table::alter()
        //             .table(Produccion::Table)
        //             .add_column(
        //                 ColumnDef::new(NewColumns::VariedadId)
        //                     .integer()
        //                     .null(),
        //             )
        //             .to_owned(),
        //     )
        //     .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Produccion::Table)
                    .add_column(ColumnDef::new(NewColumns::TipoEmpaqueId).integer().null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Produccion::Table)
                    .add_column(ColumnDef::new(NewColumns::TipoUvaId).integer().null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Produccion::Table)
                    .add_column(ColumnDef::new(NewColumns::ClienteId).integer().null())
                    .to_owned(),
            )
            .await?;

        // Nota: SQLite no permite añadir claves foráneas a tablas existentes
        // Por lo tanto, solo añadimos las columnas sin restricciones FK
        // En una aplicación real, necesitarías recrear la tabla con las FK

        // Crear índices para las nuevas columnas
        // manager
        //     .create_index(
        //         Index::create()
        //             .name("idx_produccion_variedad")
        //             .table(Produccion::Table)
        //             .col(NewColumns::VariedadId)
        //             .to_owned(),
        //     )
        //     .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_produccion_tipo_empaque")
                    .table(Produccion::Table)
                    .col(NewColumns::TipoEmpaqueId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_produccion_tipo_uva")
                    .table(Produccion::Table)
                    .col(NewColumns::TipoUvaId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_produccion_cliente")
                    .table(Produccion::Table)
                    .col(NewColumns::ClienteId)
                    .to_owned(),
            )
            .await?;

        // Seeding de 5 producciones con los nuevos campos
        // let insert_producciones = Query::insert()
        //     .into_table(Produccion::Table)
        //     .columns([
        //         "id",
        //         "fecha",
        //         "cuadrilla_id",
        //         "temporada_id",
        //         "cantidad",
        //         "tipo_empaque_id",
        //         "tipo_uva_id",
        //         "cliente_id"
        //     ])
        //     .values_panic([
        //         Expr::value(6), Expr::value("2020-07-01"), Expr::value(1), Expr::value(1), Expr::value(101), Expr::value(1), Expr::value(1)
        //     ])
        //     .values_panic([
        //         Expr::value(7), Expr::value("2021-07-15"), Expr::value(2), Expr::value(2), Expr::value(121), Expr::value(2), Expr::value(2)
        //     ])
        //     .values_panic([
        //         Expr::value(8), Expr::value("2022-08-10"), Expr::value(3), Expr::value(3), Expr::value(111), Expr::value(3), Expr::value(1)
        //     ])
        //     .values_panic([
        //         Expr::value(9), Expr::value("2023-09-05"), Expr::value(4), Expr::value(4), Expr::value(131), Expr::value(4), Expr::value(2)
        //     ])
        //     .values_panic([
        //         Expr::value(10), Expr::value("2024-10-20"), Expr::value(5), Expr::value(5), Expr::value(116), Expr::value(5), Expr::value(1)
        //     ])
        //     .to_owned();

        // manager.exec_stmt(insert_producciones).await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Primero eliminar los índices
        // manager
        //     .drop_index(
        //         Index::drop()
        //             .name("idx_produccion_variedad")
        //             .table(Produccion::Table)
        //             .to_owned(),
        //     )
        //     .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_produccion_tipo_empaque")
                    .table(Produccion::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_produccion_tipo_uva")
                    .table(Produccion::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_produccion_cliente")
                    .table(Produccion::Table)
                    .to_owned(),
            )
            .await?;

        // Después eliminar columnas una por una para SQLite
        // manager
        //     .alter_table(
        //         Table::alter()
        //             .table(Produccion::Table)
        //             .drop_column(NewColumns::VariedadId)
        //             .to_owned(),
        //     )
        //     .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Produccion::Table)
                    .drop_column(NewColumns::TipoEmpaqueId)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Produccion::Table)
                    .drop_column(NewColumns::TipoUvaId)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Produccion::Table)
                    .drop_column(NewColumns::ClienteId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

use crate::m20250526_002315_create_table_produccion::Produccion;

use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct UpdateProduccion;

#[derive(DeriveIden)]
pub enum NewColumns {
    VariedadId,
    TipoEmpaqueId,
    TipoUvaId,
    ClienteId,
}

#[async_trait::async_trait]
impl MigrationTrait for UpdateProduccion {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Agregar nuevas columnas una por una para compatibilidad con SQLite
        manager
            .alter_table(
                Table::alter()
                    .table(Produccion::Table)
                    .add_column(
                        ColumnDef::new(NewColumns::VariedadId)
                            .integer()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Produccion::Table)
                    .add_column(
                        ColumnDef::new(NewColumns::TipoEmpaqueId)
                            .integer()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Produccion::Table)
                    .add_column(
                        ColumnDef::new(NewColumns::TipoUvaId)
                            .integer()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Produccion::Table)
                    .add_column(
                        ColumnDef::new(NewColumns::ClienteId)
                            .integer()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        // Nota: SQLite no permite añadir claves foráneas a tablas existentes
        // Por lo tanto, solo añadimos las columnas sin restricciones FK
        // En una aplicación real, necesitarías recrear la tabla con las FK

        // Crear índices para las nuevas columnas
        manager
            .create_index(
                Index::create()
                    .name("idx_produccion_variedad")
                    .table(Produccion::Table)
                    .col(NewColumns::VariedadId)
                    .to_owned(),
            )
            .await?;

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
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Primero eliminar los índices
        manager
            .drop_index(
                Index::drop()
                    .name("idx_produccion_variedad")
                    .table(Produccion::Table)
                    .to_owned(),
            )
            .await?;

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
        manager
            .alter_table(
                Table::alter()
                    .table(Produccion::Table)
                    .drop_column(NewColumns::VariedadId)
                    .to_owned(),
            )
            .await?;

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
            .await
    }
} 
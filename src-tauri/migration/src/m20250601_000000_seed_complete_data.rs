use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct SeedCompleteData;

#[async_trait::async_trait]
impl MigrationTrait for SeedCompleteData {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // 1. Verificar si las tablas existen usando un approach más simple
        // Si las inserts fallan, significa que las tablas no existen todavía
        
        // 2. Insertar 6 cuadrillas (variedades 1-6, todas en temporada 2025)
        let insert_cuadrillas = Query::insert()
            .into_table(Alias::new("cuadrilla"))
            .columns([
                Alias::new("lote"),
                Alias::new("temporada_id"),
                Alias::new("variedad_id"),
            ])
            .values_panic([
                Expr::value("Lote-A1"),
                Expr::value(5), // Temporada 2025 (usando ID 5)
                Expr::value(1), // Flame
            ])
            .values_panic([
                Expr::value("Lote-B2"),
                Expr::value(5), // Temporada 2025
                Expr::value(2), // Early Sweet
            ])
            .values_panic([
                Expr::value("Lote-C3"),
                Expr::value(5), // Temporada 2025
                Expr::value(3), // Perlette
            ])
            .values_panic([
                Expr::value("Lote-D4"),
                Expr::value(5), // Temporada 2025
                Expr::value(4), // Candy Snaps
            ])
            .values_panic([
                Expr::value("Lote-E5"),
                Expr::value(5), // Temporada 2025
                Expr::value(5), // Summer Royal
            ])
            .values_panic([
                Expr::value("Lote-F6"),
                Expr::value(5), // Temporada 2025
                Expr::value(6), // Sweet Globe
            ])
            .to_owned();

        // Si falla aquí, probablemente las tablas no existen aún
        if let Err(_) = manager.exec_stmt(insert_cuadrillas).await {
            return Ok(()); // Salir silenciosamente si las tablas no existen
        }

        // 3. Insertar jornaleros (4 por cuadrilla: 3 trabajadores + 1 líder)
        let nombres = [
            // Cuadrilla 1
            "Carlos Mendoza", "Ana García", "Luis Rodríguez", "María López",
            // Cuadrilla 2
            "José Fernández", "Carmen Silva", "Miguel Torres", "Rosa Martín",
            // Cuadrilla 3
            "Antonio Pérez", "Elena Ruiz", "Francisco Díaz", "Isabel Moreno",
            // Cuadrilla 4
            "Manuel Jiménez", "Pilar Álvarez", "Rafael Romero", "Teresa Navarro",
            // Cuadrilla 5
            "Alberto Guerrero", "Lucía Herrera", "Fernando Ortega", "Cristina Delgado",
            // Cuadrilla 6
            "Diego Vázquez", "Mónica Serrano", "Julián Blanco", "Patricia Ramos",
        ];

        // Insertar jornaleros uno por uno para evitar problemas de sintaxis
        for (i, nombre) in nombres.iter().enumerate() {
            let cuadrilla_id = (i / 4) + 1; // 4 jornaleros por cuadrilla
            let edad = (25 + (i % 15)) as i32; // Edades entre 25-40
            let fecha_contratacion = "2025-01-15"; // Todos contratados en 2025
            
            let insert_jornalero = Query::insert()
                .into_table(Alias::new("jornalero"))
                .columns([
                    Alias::new("nombre"),
                    Alias::new("edad"),
                    Alias::new("estado"),
                    Alias::new("fecha_contratacion"),
                    Alias::new("errores"),
                    Alias::new("cuadrilla_id"),
                ])
                .values_panic([
                    Expr::value(*nombre),
                    Expr::value(edad),
                    Expr::value("Activo"),
                    Expr::value(fecha_contratacion),
                    Expr::value((i % 3) as i32), // Errores aleatorios entre 0-2
                    Expr::value(cuadrilla_id as i32),
                ])
                .to_owned();

            manager.exec_stmt(insert_jornalero).await?;
        }

        // 4. Actualizar líderes de cuadrilla (cada 4to jornalero es líder)
        for cuadrilla_id in 1..=6 {
            let lider_id = (cuadrilla_id * 4) as i32; // El 4to jornalero de cada cuadrilla
            
            manager
                .exec_stmt(
                    Query::update()
                        .table(Alias::new("cuadrilla"))
                        .value(Alias::new("lider_cuadrilla_id"), Expr::value(lider_id))
                        .and_where(Expr::col(Alias::new("id")).eq(cuadrilla_id as i32))
                        .to_owned(),
                )
                .await?;
        }

        // 5. Insertar registros de producción (3-6 por cuadrilla) - todas en temporada 2025
        
        // Fechas entre mayo y el 1 de junio de 2025
        let fechas_2025 = [
            "2025-05-01", "2025-05-08", "2025-05-15", "2025-05-22", 
            "2025-05-29", "2025-06-01", "2025-05-12", "2025-05-25"
        ];

        // Todas las cuadrillas - Temporada 2025
        for cuadrilla_id in 1..=6 {
            let num_registros = match cuadrilla_id {
                1 => 6, // Cuadrilla 1: 6 registros
                2 => 5, // Cuadrilla 2: 5 registros
                3 => 5, // Cuadrilla 3: 5 registros
                4 => 4, // Cuadrilla 4: 4 registros
                5 => 4, // Cuadrilla 5: 4 registros
                6 => 3, // Cuadrilla 6: 3 registros
                _ => 3,
            };
            let temporada_id = 5; // Temporada 2025 (usando ID 5)
            
            for i in 0..num_registros {
                let cantidad = 100.0 + (cuadrilla_id as f64 * 10.0) + (i as f64 * 5.0);
                
                // Distribuir valores de manera realista
                let tipo_empaque_id = ((i % 6) + 1) as i32; // Rotar entre tipos 1-6
                let tipo_uva_id = if cuadrilla_id % 2 == 1 { 1 } else { 2 }; // Alternar: Convencional/Orgánico
                let cliente_id = ((cuadrilla_id + i) % 6 + 1) as i32; // Rotar entre clientes 1-6
                
                let insert_produccion = Query::insert()
                    .into_table(Alias::new("produccion"))
                    .columns([
                        Alias::new("fecha"),
                        Alias::new("cuadrilla_id"),
                        Alias::new("temporada_id"),
                        Alias::new("cantidad"),
                        Alias::new("tipo_empaque_id"),
                        Alias::new("tipo_uva_id"),
                        Alias::new("cliente_id"),
                    ])
                    .values_panic([
                        Expr::value(fechas_2025[i]),
                        Expr::value(cuadrilla_id as i32),
                        Expr::value(temporada_id),
                        Expr::value(cantidad),
                        Expr::value(tipo_empaque_id),
                        Expr::value(tipo_uva_id),
                        Expr::value(cliente_id),
                    ])
                    .to_owned();

                manager.exec_stmt(insert_produccion).await?;
            }
        }

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Eliminar solo los datos específicos del seeding, no todos los datos
        
        // 1. Eliminar registros de producción de 2025 (solo los del seeding)
        let _ = manager
            .exec_stmt(
                Query::delete()
                    .from_table(Alias::new("produccion"))
                    .and_where(Expr::col(Alias::new("temporada_id")).eq(5)) // Solo temporada 2025
                    .to_owned(),
            )
            .await;

        // 2. Actualizar líderes de cuadrilla específicas a null
        for cuadrilla_id in 1..=6 {
            let _ = manager
                .exec_stmt(
                    Query::update()
                        .table(Alias::new("cuadrilla"))
                        .value(Alias::new("lider_cuadrilla_id"), Expr::value(Option::<i32>::None))
                        .and_where(Expr::col(Alias::new("id")).eq(cuadrilla_id))
                        .to_owned(),
                )
                .await;
        }

        // 3. Eliminar jornaleros específicos (los que están en cuadrillas 1-6)
        for cuadrilla_id in 1..=6 {
            let _ = manager
                .exec_stmt(
                    Query::delete()
                        .from_table(Alias::new("jornalero"))
                        .and_where(Expr::col(Alias::new("cuadrilla_id")).eq(cuadrilla_id))
                        .to_owned(),
                )
                .await;
        }

        // 4. Eliminar cuadrillas específicas (solo las 6 del seeding)
        for cuadrilla_id in 1..=6 {
            let _ = manager
                .exec_stmt(
                    Query::delete()
                        .from_table(Alias::new("cuadrilla"))
                        .and_where(Expr::col(Alias::new("id")).eq(cuadrilla_id))
                        .to_owned(),
                )
                .await;
        }

        Ok(())
    }
} 
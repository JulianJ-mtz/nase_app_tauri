#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use app_lib::obt_connection;
use sea_orm::{ConnectionTrait, Statement};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let connection = obt_connection().await?;

    println!("CONECTADOOOO!!");

    // let crear_tabla = Statement::from_string(
    //     connection.get_database_backend(),
    //     r#"
    //         CREATE TABLE IF NOT EXISTS Prueba(
    //         id int, 
    //         nombre varchar(150)
    //     )
    //     "#,
    // );

    // connection.execute(crear_tabla).await?;

    // let insert = Statement::from_sql_and_values(
    //     connection.get_database_backend(),
    //     r#"
    //         INSERT INTO prueba(id, nombre)
    //         VALUES ($1, $2)
    //     "#,
    //     [1.into(), "NICEEEEEE".into()],
    // );

    // connection.execute(insert).await?;

    // println!("Registro ORM exitoso");

    // let migrations = vec![
    //     Migration {
    //         version: 1,
    //         description: "init db",
    //         sql: "CREATE TABLE IF NOT EXISTS empleadosTest (
    //             id INTEGER PRIMARY KEY AUTOINCREMENT,
    //             nombre TEXT NOT NULL,
    //             apellido TEXT NOT NULL,
    //             cargo TEXT,
    //             fecha_contratacion TEXT,
    //             salario REAL,
    //             activo INTEGER DEFAULT 1
    //         );",
    //         kind: MigrationKind::Up,
    //     },
    //     Migration {
    //         version: 2,
    //         description: "seed data",
    //         sql: "INSERT INTO empleadosTest (nombre, apellido, cargo, fecha_contratacion, salario, activo) VALUES
    //             ('Juan', 'Pérez', 'Desarrollador', '2023-01-15', 45000.00, 1),
    //             ('María', 'González', 'Diseñadora', '2023-02-20', 42000.00, 1),
    //             ('Carlos', 'Rodríguez', 'Gerente', '2022-11-05', 65000.00, 1)",
    //         kind: MigrationKind::Up,
    //     },
    // ];

    tauri::Builder::default()
        // .plugin(
        //     tauri_plugin_sql::Builder::default()
        //         .add_migrations("sqlite:test_nase.db", migrations)
        //         .build(),
        // )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}

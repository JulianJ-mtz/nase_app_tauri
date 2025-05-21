// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_sql::{Migration, MigrationKind};

fn main() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "init db",
            sql: "CREATE TABLE IF NOT EXISTS empleadosTest (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                apellido TEXT NOT NULL,
                cargo TEXT,
                fecha_contratacion TEXT,
                salario REAL,
                activo INTEGER DEFAULT 1
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "seed data",
            sql: "INSERT INTO empleadosTest (nombre, apellido, cargo, fecha_contratacion, salario, activo) VALUES
                ('Juan', 'Pérez', 'Desarrollador', '2023-01-15', 45000.00, 1),
                ('María', 'González', 'Diseñadora', '2023-02-20', 42000.00, 1),
                ('Carlos', 'Rodríguez', 'Gerente', '2022-11-05', 65000.00, 1)",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:test_nase.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

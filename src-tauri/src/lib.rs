#[cfg_attr(mobile, tauri::mobile_entry_point)]
use sea_orm::{Database, DatabaseConnection, DbErr};
use std::env;
use std::path::PathBuf;

pub async fn obt_connection() -> Result<DatabaseConnection, DbErr> {
    let mut db_path = PathBuf::from(env::current_dir().unwrap_or_default());
    db_path.push("test_nase.db");

    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    println!("Conectando a: {}", db_url);

    let connection = Database::connect(&db_url).await?;
    Ok(connection)
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

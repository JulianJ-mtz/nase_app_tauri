#[cfg_attr(mobile, tauri::mobile_entry_point)]
use sea_orm::{Database, DatabaseConnection, DbErr, ConnectOptions};
use std::env;
use std::time::Duration;
use tauri::Manager;

pub async fn obt_connection(app_handle: &tauri::AppHandle) -> Result<DatabaseConnection, DbErr> {
    // Obtener el directorio de datos de la aplicación (fuera del código fuente)
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("No se pudo obtener el directorio de datos");
    
    // Crear el directorio si no existe
    if let Err(e) = std::fs::create_dir_all(&app_data_dir) {
        return Err(DbErr::Custom(format!("Error creando directorio: {}", e)));
    }
    
    let db_path = app_data_dir.join("test_nase.db");
    let db_url = format!("sqlite:{}", db_path.to_string_lossy());
    
    println!("Conectando a: {}", db_url);
    
    // Configurar opciones de conexión
    let mut opt = ConnectOptions::new(db_url);
    opt.max_connections(10)
        .min_connections(1)
        .connect_timeout(Duration::from_secs(10))
        .idle_timeout(Duration::from_secs(10))
        .sqlx_logging(true);
    
    println!("Estableciendo conexión a la base de datos...");
    let connection = Database::connect(opt).await?;
    println!("Conexión establecida correctamente.");
    
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

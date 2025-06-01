#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use once_cell::sync::Lazy;
use std::sync::Mutex;

mod controllers;
mod entities;
use controllers::*;

// Estructura para mantener el estado global
#[derive(Default)]
pub struct AppState {
    // Contador de operaciones para debug
    operation_count: u32,
}

// Estado global de la aplicación
pub static APP_STATE: Lazy<Mutex<AppState>> = Lazy::new(|| Mutex::new(AppState::default()));

fn main() {
    // Configurar la aplicación Tauri
    tauri::Builder::default()
        // Establecer el manejador de invocación
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            
            // === Jornaleros ===
            post_jornalero,
            get_jornaleros,
            get_all_jornaleros,
            get_inactive_jornaleros,
            get_jornalero_by_id,
            put_jornalero,
            delete_jornalero,
            reactivate_jornalero,
            get_jornaleros_by_cuadrilla,
            
            // === Cuadrillas ===
            get_cuadrillas,
            post_cuadrilla,
            get_cuadrilla_by_id,
            put_cuadrilla,
            delete_cuadrilla,
            get_cuadrilla_delete_warning,
            force_delete_cuadrilla,
            reassign_jornaleros_from_cuadrilla,
            
            // === Producción ===
            post_produccion,
            get_produccion,
            get_produccion_by_id,
            put_produccion,
            delete_produccion,
            
            // === Temporadas ===
            post_temporada,
            get_temporadas,
            get_temporada_by_id,
            put_temporada,
            delete_temporada,
            
            // === Tipo Uva ===
            post_tipo_uva,
            get_tipo_uva,
            get_tipo_uva_by_id,
            put_tipo_uva,
            delete_tipo_uva,
            
            // === Tipo Empaque ===
            post_tipo_empaque,
            get_tipo_empaque,
            get_tipo_empaque_by_id,
            put_tipo_empaque,
            delete_tipo_empaque,
            
            // === Variedad ===
            post_variedad,
            get_variedad,
            get_variedad_by_id,
            put_variedad,
            delete_variedad,
            
            // === Cliente ===
            post_cliente,
            get_cliente,
            get_cliente_by_id,
            put_cliente,
            delete_cliente
        ])
        // Iniciar la aplicación
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

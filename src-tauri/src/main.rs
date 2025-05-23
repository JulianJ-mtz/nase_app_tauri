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
            insertar_jornalero,
            obtener_jornaleros,
            obtener_jornalero_por_id,
            actualizar_jornalero
        ])
        // Iniciar la aplicación
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

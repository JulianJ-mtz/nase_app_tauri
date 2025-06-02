#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::{engine::general_purpose, Engine as _};
use once_cell::sync::Lazy;
use std::collections::HashMap;
use std::fs::File;
use std::io::Write;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tiny_http::{Header, Response, Server};
use url::Url;
mod controllers;
mod entities;
use controllers::*;

// Estructura para mantener el estado global
#[derive(Default)]
pub struct AppState {
    // Contador de operaciones para debug
    operation_count: u32,
}

#[derive(Default)]
struct OAuthState {
    code: Arc<Mutex<Option<String>>>,
    server_running: Arc<Mutex<bool>>,
}

// Estado global de la aplicación
pub static APP_STATE: Lazy<Mutex<AppState>> = Lazy::new(|| Mutex::new(AppState::default()));

// Función para escribir archivos Excel
#[tauri::command]
async fn write_excel_file(path: String, data: String) -> Result<(), String> {
    // Decodificar base64 a bytes
    let bytes = general_purpose::STANDARD
        .decode(data)
        .map_err(|e| format!("Error decodificando base64: {}", e))?;

    // Escribir archivo
    let mut file = File::create(&path).map_err(|e| format!("Error creando archivo: {}", e))?;

    file.write_all(&bytes)
        .map_err(|e| format!("Error escribiendo archivo: {}", e))?;

    Ok(())
}

// Comando mejorado para obtener el código OAuth
#[tauri::command]
async fn get_oauth_code() -> Result<String, String> {
    println!("Iniciando servidor OAuth en puerto 8080...");

    // Crear estado compartido
    let code_storage = Arc::new(Mutex::new(None::<String>));
    let server_running = Arc::new(Mutex::new(true));

    let code_storage_clone = code_storage.clone();
    let server_running_clone = server_running.clone();

    // Iniciar servidor en un hilo separado
    let server_handle = thread::spawn(move || {
        let server = match Server::http("127.0.0.1:8080") {
            Ok(server) => {
                println!("Servidor OAuth iniciado exitosamente en http://127.0.0.1:8080");
                server
            }
            Err(e) => {
                eprintln!("Error iniciando servidor: {}", e);
                return;
            }
        };

        for request in server.incoming_requests() {
            // Verificar si debemos seguir ejecutando
            if let Ok(running) = server_running_clone.lock() {
                if !*running {
                    break;
                }
            }

            let url_string = format!("http://127.0.0.1:8080{}", request.url());
            println!("Recibida petición: {}", request.url());

            if let Ok(url) = Url::parse(&url_string) {
                let query_pairs: HashMap<String, String> = url.query_pairs().into_owned().collect();

                if let Some(code) = query_pairs.get("code") {
                    println!(
                        "Código OAuth recibido: {}...",
                        &code[..std::cmp::min(10, code.len())]
                    );

                    // Almacenar el código
                    if let Ok(mut code_lock) = code_storage_clone.lock() {
                        *code_lock = Some(code.clone());
                    }

                    // Responder al navegador con página de éxito
                    let response_html = create_success_page();
                    let response = Response::from_string(response_html).with_header(
                        Header::from_bytes(&b"Content-Type"[..], &b"text/html; charset=utf-8"[..])
                            .unwrap(),
                    );

                    let _ = request.respond(response);

                    // Detener el servidor
                    if let Ok(mut running) = server_running_clone.lock() {
                        *running = false;
                    }
                    break;
                } else if query_pairs.contains_key("error") {
                    let default_error = "unknown_error".to_string();
                    let error = query_pairs.get("error").unwrap_or(&default_error);
                    println!("Error OAuth recibido: {}", error);

                    // Responder con página de error
                    let response_html = create_error_page(error);
                    let response = Response::from_string(response_html).with_header(
                        Header::from_bytes(&b"Content-Type"[..], &b"text/html; charset=utf-8"[..])
                            .unwrap(),
                    );

                    let _ = request.respond(response);

                    // Detener el servidor
                    if let Ok(mut running) = server_running_clone.lock() {
                        *running = false;
                    }
                    break;
                }
            }
        }

        println!("Servidor OAuth detenido");
    });

    // Esperar el código con timeout de 2 minutos
    for i in 0..120 {
        thread::sleep(Duration::from_secs(1));

        if let Ok(code_lock) = code_storage.lock() {
            if let Some(ref code) = *code_lock {
                let result = code.clone();

                // Detener el servidor
                if let Ok(mut running) = server_running.lock() {
                    *running = false;
                }

                println!("Código OAuth obtenido exitosamente");
                return Ok(result);
            }
        }

        // Log de progreso cada 10 segundos
        if i % 10 == 0 && i > 0 {
            println!("Esperando código OAuth... ({}/120 segundos)", i);
        }
    }

    // Timeout alcanzado
    if let Ok(mut running) = server_running.lock() {
        *running = false;
    }

    Err("Timeout: No se recibió el código de autorización en 2 minutos".to_string())
}

// Función para cargar template HTML
fn load_html_template(template_name: &str) -> Result<String, String> {
    match template_name {
        "oauth_success.html" => Ok(include_str!("templates/oauth_success.html").to_string()),
        "oauth_error.html" => Ok(include_str!("templates/oauth_error.html").to_string()),
        _ => Err(format!("Template no encontrado: {}", template_name))
    }
}

// Función para reemplazar placeholders en template
fn replace_template_vars(template: String, vars: HashMap<&str, &str>) -> String {
    let mut result = template;
    for (key, value) in vars {
        result = result.replace(&format!("{{{{{}}}}}", key), value);
    }
    result
}

fn create_success_page() -> String {
    load_html_template("oauth_success.html")
        .unwrap_or_else(|e| {
            eprintln!("Error cargando template: {}", e);
            "<!DOCTYPE html><html><body><h1>Autorización exitosa</h1><p>Puedes cerrar esta ventana.</p></body></html>".to_string()
        })
}

fn create_error_page(error: &str) -> String {
    match load_html_template("oauth_error.html") {
        Ok(template) => {
            let mut vars = HashMap::new();
            vars.insert("ERROR_MESSAGE", error);
            replace_template_vars(template, vars)
        }
        Err(e) => {
            eprintln!("Error cargando template: {}", e);
            format!("<!DOCTYPE html><html><body><h1>Error de autorización</h1><p>Error: {}</p></body></html>", error)
        }
    }
}

fn main() {
    // Configurar la aplicación Tauri
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        // Establecer el manejador de invocación
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            // === Archivos ===
            write_excel_file,
            get_oauth_code,
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

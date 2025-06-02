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

fn create_success_page() -> String {
    r#"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autorización Completada</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center; 
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
        }
        .success-icon {
            font-size: 4rem;
            color: #28a745;
            margin-bottom: 20px;
        }
        h2 {
            color: #333;
            margin-bottom: 15px;
        }
        p {
            color: #666;
            font-size: 1.1em;
            line-height: 1.5;
        }
        .countdown {
            font-weight: bold;
            color: #007bff;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✓</div>
        <h2>¡Autorización Completada!</h2>
        <p>Tu cuenta de Google Drive ha sido vinculada exitosamente.</p>
        <p>Esta ventana se cerrará automáticamente en <span class="countdown" id="countdown">5</span> segundos.</p>
        <p><small>También puedes cerrar esta ventana manualmente.</small></p>
    </div>
    <script>
        let seconds = 5;
        const countdownEl = document.getElementById('countdown');
        
        const interval = setInterval(() => {
            seconds--;
            countdownEl.textContent = seconds;
            
            if (seconds <= 0) {
                clearInterval(interval);
                window.close();
            }
        }, 1000);
    </script>
</body>
</html>
    "#.to_string()
}

fn create_error_page(error: &str) -> String {
    format!(
        r#"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error de Autorización</title>
    <style>
        body {{ 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center; 
            padding: 50px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        .container {{
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
        }}
        .error-icon {{
            font-size: 4rem;
            color: #dc3545;
            margin-bottom: 20px;
        }}
        h2 {{
            color: #333;
            margin-bottom: 15px;
        }}
        p {{
            color: #666;
            font-size: 1.1em;
            line-height: 1.5;
        }}
        .error-code {{
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            color: #dc3545;
            margin: 15px 0;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="error-icon">✗</div>
        <h2>Error de Autorización</h2>
        <p>Hubo un problema durante la autorización con Google Drive.</p>
        <div class="error-code">Error: {}</div>
        <p>Por favor, cierra esta ventana e intenta de nuevo desde la aplicación.</p>
        <p><small>Esta ventana se cerrará automáticamente en 10 segundos.</small></p>
    </div>
    <script>
        setTimeout(() => window.close(), 10000);
    </script>
</body>
</html>
    "#,
        error
    )
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

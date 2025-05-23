#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use app_lib::obt_connection;
use once_cell::sync::Lazy;
use sea_orm::prelude::*;
use sea_orm::*;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

mod entities;
use entities::prelude::*;
use entities::*;

// Estructura para mantener el estado global
#[derive(Default)]
struct AppState {
    // Contador de operaciones para debug
    operation_count: u32,
}

// Estado global de la aplicación
static APP_STATE: Lazy<Mutex<AppState>> = Lazy::new(|| Mutex::new(AppState::default()));

#[derive(Debug, Serialize, Deserialize)]
struct JornaleroData {
    nombre: String,
    edad: i32,
    produccion: Option<i32>,
    errores: i32,
    activo: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
struct JornaleroResponse {
    id: i32,
    nombre: String,
    edad: i32,
    produccion: Option<i32>,
    errores: i32,
    activo: Option<bool>,
}

impl From<jornalero::Model> for JornaleroResponse {
    fn from(model: jornalero::Model) -> Self {
        Self {
            id: model.id,
            nombre: model.nombre,
            edad: model.edad,
            produccion: model.produccion,
            errores: model.errores,
            activo: model.activo,
        }
    }
}

#[tauri::command]
async fn insertar_jornalero(
    app_handle: tauri::AppHandle,
    nombre: String,
    edad: i32,
    produccion: Option<i32>,
    errores: i32,
    activo: Option<bool>,
) -> Result<String, String> {
    // Incrementar contador para debug
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de inserción #{}", state.operation_count);
    }

    // Obtener conexión a la base de datos
    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    let jornalero = jornalero::ActiveModel {
        id: ActiveValue::NotSet,
        nombre: ActiveValue::Set(nombre),
        edad: ActiveValue::Set(edad),
        produccion: ActiveValue::Set(produccion),
        errores: ActiveValue::Set(errores),
        activo: ActiveValue::Set(activo),
    };

    // Ejecutar inserción
    let res = match Jornalero::insert(jornalero).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al insertar jornalero: {}", e);
            return Err(format!("Error de inserción: {}", e));
        }
    };

    // Cerrar la conexión explícitamente (aunque sea innecesario)
    drop(connection);

    Ok(format!(
        "Jornalero insertado con ID: {}",
        res.last_insert_id
    ))
}

#[tauri::command]
async fn obtener_jornaleros(app_handle: tauri::AppHandle) -> Result<Vec<JornaleroResponse>, String> {
    // Incrementar contador para debug
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de consulta #{}", state.operation_count);
    }

    // Obtener conexión
    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    // Ejecutar consulta
    let jornaleros = match Jornalero::find().all(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al consultar jornaleros: {}", e);
            return Err(format!("Error de consulta: {}", e));
        }
    };

    // Cerrar conexión
    drop(connection);

    // Convertir los modelos a la respuesta serializable
    let response = jornaleros
        .into_iter()
        .map(JornaleroResponse::from)
        .collect();

    Ok(response)
}

#[tauri::command]
async fn obtener_jornalero_por_id(app_handle: tauri::AppHandle, id: i32) -> Result<Option<JornaleroResponse>, String> {
    // Incrementar contador para debug
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de búsqueda por ID #{}", state.operation_count);
    }

    // Obtener conexión
    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    // Ejecutar consulta
    let jornalero = match Jornalero::find_by_id(id).one(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al buscar jornalero por ID: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    // Cerrar conexión
    drop(connection);

    // Convertir el modelo a la respuesta serializable si existe
    let response = jornalero.map(JornaleroResponse::from);

    Ok(response)
}

#[tauri::command]
async fn actualizar_jornalero(
    app_handle: tauri::AppHandle,
    id: i32,
    nombre: String,
    edad: i32,
    produccion: Option<i32>,
    errores: i32,
    activo: Option<bool>,
) -> Result<String, String> {
    // Incrementar contador para debug
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de actualización #{}", state.operation_count);
    }

    // Obtener conexión a la base de datos
    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    // Verificar que el jornalero existe
    let jornalero_existente = match Jornalero::find_by_id(id).one(&connection).await {
        Ok(Some(j)) => j,
        Ok(None) => {
            return Err(format!("No existe un jornalero con ID: {}", id));
        }
        Err(e) => {
            println!("Error al buscar jornalero: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    // Crear el modelo activo para actualizar
    let mut jornalero_actualizado: jornalero::ActiveModel = jornalero_existente.into();

    // Actualizar los campos
    jornalero_actualizado.nombre = ActiveValue::Set(nombre);
    jornalero_actualizado.edad = ActiveValue::Set(edad);
    jornalero_actualizado.produccion = ActiveValue::Set(produccion);
    jornalero_actualizado.errores = ActiveValue::Set(errores);
    jornalero_actualizado.activo = ActiveValue::Set(activo);

    // Ejecutar actualización
    let res = match jornalero_actualizado.update(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al actualizar jornalero: {}", e);
            return Err(format!("Error de actualización: {}", e));
        }
    };

    // Cerrar la conexión explícitamente
    drop(connection);

    Ok(format!("Jornalero ID: {} actualizado con éxito", res.id))
}

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

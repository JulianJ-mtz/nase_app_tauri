use crate::entities::prelude::*;
use crate::entities::temporada::Model;
use crate::entities::*;
use crate::APP_STATE;
use app_lib::obt_connection;
use rust_decimal::Decimal;
use sea_orm::prelude::*;
use sea_orm::*;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct TemporadaData {
    pub id: i32,
    pub fecha_inicial: String, // Se recibe como string para facilitar la serialización
    pub fecha_final: String,   // Se recibe como string para facilitar la serialización
    pub meses: i32,
    pub produccion_total: Option<Decimal>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TemporadaResponse {
    pub id: i32,
    pub fecha_inicial: String,
    pub fecha_final: String,
    pub meses: i32,
    pub produccion_total: Option<Decimal>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl From<temporada::Model> for TemporadaResponse {
    fn from(model: temporada::Model) -> Self {
        TemporadaResponse {
            id: model.id,
            fecha_inicial: model.fecha_inicial.to_string(),
            fecha_final: model.fecha_final.to_string(),
            meses: model.meses,
            produccion_total: model.produccion_total,
            created_at: model.created_at.map(|dt| dt.to_string()),
            updated_at: model.updated_at.map(|dt| dt.to_string()),
        }
    }
}

#[tauri::command]
pub async fn post_temporada(app_handle: AppHandle, data: TemporadaData) -> Result<String, String> {
    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    // Parsear las fechas desde string a Date
    let fecha_inicial = match Date::parse_from_str(&data.fecha_inicial, "%Y-%m-%d") {
        Ok(date) => date,
        Err(e) => {
            println!("Error al parsear fecha inicial: {}", e);
            return Err(format!("Error en formato de fecha inicial: {}", e));
        }
    };

    let fecha_final = match Date::parse_from_str(&data.fecha_final, "%Y-%m-%d") {
        Ok(date) => date,
        Err(e) => {
            println!("Error al parsear fecha final: {}", e);
            return Err(format!("Error en formato de fecha final: {}", e));
        }
    };

    let temporada = temporada::ActiveModel {
        id: ActiveValue::NotSet,
        fecha_inicial: ActiveValue::Set(fecha_inicial),
        fecha_final: ActiveValue::Set(fecha_final),
        meses: ActiveValue::Set(data.meses),
        produccion_total: ActiveValue::Set(data.produccion_total),
        created_at: ActiveValue::NotSet,
        updated_at: ActiveValue::NotSet,
    };

    let res = match Temporada::insert(temporada).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al insertar temporada: {}", e);
            return Err(format!("Error de inserción: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Temporada insertada con ID: {}",
        res.last_insert_id
    ))
}

#[tauri::command]
pub async fn get_temporadas(app_handle: AppHandle) -> Result<Vec<TemporadaResponse>, String> {
    // Incrementar contador para debug
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de consulta #{}", state.operation_count);
    }

    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    let temporadas = match Temporada::find().all(&connection).await {
        Ok(temporadas) => temporadas,
        Err(e) => {
            println!("Error al obtener temporadas: {}", e);
            return Err(format!("Error al obtener temporadas: {}", e));
        }
    };

    let res = temporadas
        .into_iter()
        .map(TemporadaResponse::from)
        .collect();

    drop(connection);

    Ok(res)
}

#[tauri::command]
pub async fn get_temporada_by_id(
    app_handle: AppHandle,
    id: i32,
) -> Result<Option<TemporadaResponse>, String> {
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de búsqueda por ID #{}", state.operation_count);
    }

    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    let temporada = match Temporada::find_by_id(id).one(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al buscar temporada por ID {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let res: Option<TemporadaResponse> = temporada.map(TemporadaResponse::from);

    drop(connection);

    Ok(res)
}

#[tauri::command]
pub async fn put_temporada(
    app_handle: AppHandle,
    id: i32,
    data: TemporadaData,
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

    let temporada_existente: Model = match Temporada::find_by_id(id).one(&connection).await {
        Ok(Some(t)) => t,
        Ok(None) => {
            return Err(format!("No existe una temporada con ID: {}", id));
        }
        Err(e) => {
            println!("Error al buscar temporada: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    // Parsear las fechas desde string a Date
    let fecha_inicial = match Date::parse_from_str(&data.fecha_inicial, "%Y-%m-%d") {
        Ok(date) => date,
        Err(e) => {
            println!("Error al parsear fecha inicial: {}", e);
            return Err(format!("Error en formato de fecha inicial: {}", e));
        }
    };

    let fecha_final = match Date::parse_from_str(&data.fecha_final, "%Y-%m-%d") {
        Ok(date) => date,
        Err(e) => {
            println!("Error al parsear fecha final: {}", e);
            return Err(format!("Error en formato de fecha final: {}", e));
        }
    };

    let mut temporada_actualizada: temporada::ActiveModel = temporada_existente.into();

    temporada_actualizada.fecha_inicial = ActiveValue::Set(fecha_inicial);
    temporada_actualizada.fecha_final = ActiveValue::Set(fecha_final);
    temporada_actualizada.meses = ActiveValue::Set(data.meses);
    temporada_actualizada.produccion_total = ActiveValue::Set(data.produccion_total);

    let res = match temporada_actualizada.update(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al actualizar temporada: {}", e);
            return Err(format!("Error de actualización: {}", e));
        }
    };

    drop(connection);

    Ok(format!("Temporada ID: {} actualizada con éxito", res.id))
}

#[tauri::command]
pub async fn delete_temporada(app_handle: AppHandle, id: i32) -> Result<String, String> {
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de eliminación #{}", state.operation_count);
    }

    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    let res = match Temporada::delete_by_id(id).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al eliminar temporada: {}", e);
            return Err(format!("Error de eliminación: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Temporada ID: {} eliminada con éxito. Filas afectadas: {}",
        id, res.rows_affected
    ))
}

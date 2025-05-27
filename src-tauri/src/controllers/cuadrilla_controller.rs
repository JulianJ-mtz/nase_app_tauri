use crate::entities::prelude::*;
use crate::entities::*;
use crate::APP_STATE;
use app_lib::obt_connection;
use rust_decimal::Decimal;
use sea_orm::prelude::*;
use sea_orm::*;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct CuadrillaData {
    pub id: i32,
    pub lider_cuadrilla: Option<i32>,
    pub produccion_cuadrilla: Option<Decimal>,
    pub lote: String,
    pub variedad: String,
    pub integrantes: Option<i32>,
    pub temporada_id: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CuadrillaResponse {
    pub id: i32,
    pub lider_cuadrilla: Option<i32>,
    pub produccion_cuadrilla: Option<Decimal>,
    pub lote: String,
    pub variedad: String,
    pub integrantes: Option<i32>,
    pub temporada_id: Option<i32>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl From<cuadrilla::Model> for CuadrillaResponse {
    fn from(model: cuadrilla::Model) -> Self {
        CuadrillaResponse {
            id: model.id,
            lider_cuadrilla: model.lider_cuadrilla,
            produccion_cuadrilla: model.produccion_cuadrilla,
            lote: model.lote,
            variedad: model.variedad,
            integrantes: model.integrantes,
            temporada_id: model.temporada_id,
            created_at: model.created_at.map(|dt| dt.to_string()),
            updated_at: model.updated_at.map(|dt| dt.to_string()),
        }
    }
}

#[tauri::command]
pub async fn post_cuadrilla(app_handle: AppHandle, data: CuadrillaData) -> Result<String, String> {
    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    let cuadrilla = cuadrilla::ActiveModel {
        id: ActiveValue::NotSet,
        lider_cuadrilla: ActiveValue::Set(data.lider_cuadrilla),
        produccion_cuadrilla: ActiveValue::Set(data.produccion_cuadrilla),
        lote: ActiveValue::Set(data.lote),
        variedad: ActiveValue::Set(data.variedad),
        integrantes: ActiveValue::Set(data.integrantes),
        temporada_id: ActiveValue::Set(data.temporada_id),
        created_at: ActiveValue::NotSet,
        updated_at: ActiveValue::NotSet,
    };

    let res = match Cuadrilla::insert(cuadrilla).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al insertar cuadrilla: {}", e);
            return Err(format!("Error de inserción: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Cuadrilla insertada con ID: {}",
        res.last_insert_id
    ))
}

#[tauri::command]
pub async fn get_cuadrillas(app_handle: AppHandle) -> Result<Vec<CuadrillaResponse>, String> {
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

    let cuadrillas = match Cuadrilla::find().all(&connection).await {
        Ok(cuadrillas) => cuadrillas,
        Err(e) => {
            println!("Error al obtener cuadrillas: {}", e);
            return Err(format!("Error al obtener cuadrillas: {}", e));
        }
    };

    drop(connection);

    let res = cuadrillas
        .into_iter()
        .map(CuadrillaResponse::from)
        .collect();

    Ok(res)
}

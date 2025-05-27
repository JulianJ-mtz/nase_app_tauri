use crate::entities::cuadrilla::Model;
use crate::entities::prelude::*;
use crate::entities::*;
use crate::APP_STATE;
use app_lib::obt_connection;
use rust_decimal::Decimal;
use sea_orm::prelude::*;
use sea_orm::*;
use serde::{Deserialize, Serialize};
// use std::str::FromStr;
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

    let res = cuadrillas
        .into_iter()
        .map(CuadrillaResponse::from)
        .collect();

    drop(connection);

    Ok(res)
}

#[tauri::command]
pub async fn get_cuadrilla_by_id(
    app_handle: AppHandle,
    id: i32,
) -> Result<Option<CuadrillaResponse>, String> {
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

    let cuadrilla = match Cuadrilla::find_by_id(id).one(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Eror al buscar cuadrilla por ID {}", e);
            return Err(format!("Error de busqueda: {}", e));
        }
    };

    let res: Option<CuadrillaResponse> = cuadrilla.map(CuadrillaResponse::from);

    drop(connection);

    Ok(res)
}


#[tauri::command]
pub async fn put_cuadrilla(
    app_handle: AppHandle,
    id: i32,
    data: CuadrillaData,
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

    let cuadrilla_existente: Model = match Cuadrilla::find_by_id(id).one(&connection).await {
        Ok(Some(c)) => c,
        Ok(None) => {
            return Err(format!("No existe una cuadrilla con ID: {}", id));
        }
        Err(e) => {
            println!("Error al buscar cuadrilla: {}", e);
            return Err(format!("Error de busqueda: {}", e));
        }
    };

    let mut cuadrilla_actulizada: cuadrilla::ActiveModel = cuadrilla_existente.into();

    cuadrilla_actulizada.lider_cuadrilla = ActiveValue::Set(data.lider_cuadrilla);
    cuadrilla_actulizada.integrantes = ActiveValue::Set(data.integrantes);
    cuadrilla_actulizada.produccion_cuadrilla = ActiveValue::Set(data.produccion_cuadrilla);
    cuadrilla_actulizada.lote = ActiveValue::Set(data.lote);
    cuadrilla_actulizada.integrantes = ActiveValue::Set(data.integrantes);
    cuadrilla_actulizada.variedad = ActiveValue::Set(data.variedad);
    cuadrilla_actulizada.temporada_id = ActiveValue::Set(data.temporada_id);

    let res = match cuadrilla_actulizada.update(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al actualizar cuadrilla: {}", e);
            return Err(format!("Error de actualización: {}", e));
        }
    };

    drop(connection);

    Ok(format!("Cuadrilla ID: {} actualizado con éxito", res.id))
}

#[tauri::command]
pub async fn delete_cuadrilla(app_handle: AppHandle, id: i32) -> Result<String, String> {
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

    let res = match Cuadrilla::delete_by_id(id).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al eliminar cuadrilla: {}", e);
            return Err(format!("Error de eliminación: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Cuadrilla ID: {} eliminado con éxito",
        res.rows_affected
    ))
}

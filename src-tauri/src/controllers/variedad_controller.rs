use crate::entities::prelude::*;
use crate::entities::variedad::Model;
use crate::entities::*;
use crate::APP_STATE;
use app_lib::obt_connection;
use sea_orm::prelude::*;
use sea_orm::*;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct VariedadData {
    pub codigo: i32,
    pub nombre: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VariedadResponse {
    pub id: i32,
    pub codigo: i32,
    pub nombre: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl From<variedad::Model> for VariedadResponse {
    fn from(model: variedad::Model) -> Self {
        VariedadResponse {
            id: model.id,
            codigo: model.codigo,
            nombre: model.nombre,
            created_at: model.created_at.map(|dt| dt.to_string()),
            updated_at: model.updated_at.map(|dt| dt.to_string()),
        }
    }
}

#[tauri::command]
pub async fn post_variedad(app_handle: AppHandle, data: VariedadData) -> Result<String, String> {
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de inserción #{}", state.operation_count);
    }

    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    let variedad = variedad::ActiveModel {
        codigo: Set(data.codigo),
        nombre: Set(data.nombre),
        ..Default::default()
    };

    let res = match Variedad::insert(variedad).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al insertar variedad: {}", e);
            return Err(format!("Error de inserción: {}", e));
        }
    };

    drop(connection);

    Ok(format!("Variedad creada correctamente con ID: {}", res.last_insert_id))
}

#[tauri::command]
pub async fn get_variedad(app_handle: AppHandle) -> Result<Vec<VariedadResponse>, String> {
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de búsqueda #{}", state.operation_count);
    }

    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    let variedades = match Variedad::find().all(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al buscar variedades: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let res = variedades.into_iter().map(VariedadResponse::from).collect();

    drop(connection);

    Ok(res)
}

#[tauri::command]
pub async fn get_variedad_by_id(app_handle: AppHandle, id: i32) -> Result<Option<VariedadResponse>, String> {
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de búsqueda #{}", state.operation_count);
    }

    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    let variedad = match Variedad::find_by_id(id).one(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al buscar variedad por ID: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let res = variedad.map(VariedadResponse::from);

    drop(connection);

    Ok(res)
}

#[tauri::command]
pub async fn put_variedad(
    app_handle: AppHandle,
    id: i32,
    data: VariedadData,
) -> Result<String, String> {
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de actualización #{}", state.operation_count);
    }

    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    let variedad_existente: Model = match Variedad::find_by_id(id).one(&connection).await {
        Ok(Some(t)) => t,
        Ok(None) => {
            return Err(format!("No existe una variedad con ID: {}", id));
        }
        Err(e) => {
            println!("Error al buscar variedad: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let mut variedad_actualizada: variedad::ActiveModel = variedad_existente.into();

    variedad_actualizada.codigo = Set(data.codigo);
    variedad_actualizada.nombre = Set(data.nombre);

    let res = match variedad_actualizada.update(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al actualizar variedad: {}", e);
            return Err(format!("Error de actualización: {}", e));
        }
    };

    drop(connection);

    Ok(format!("Variedad actualizada correctamente con ID: {}", res.id))
}

#[tauri::command]
pub async fn delete_variedad(app_handle: AppHandle, id: i32) -> Result<String, String> {
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

    let res = match Variedad::delete_by_id(id).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al eliminar variedad: {}", e);
            return Err(format!("Error de eliminación: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Variedad eliminada correctamente. Filas afectadas: {}",
        res.rows_affected
    ))
} 
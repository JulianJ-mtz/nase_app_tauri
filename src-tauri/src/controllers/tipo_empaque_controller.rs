use crate::entities::prelude::*;
use crate::entities::tipo_empaque::Model;
use crate::entities::*;
use crate::APP_STATE;
use app_lib::obt_connection;
use sea_orm::prelude::*;
use sea_orm::*;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct TipoEmpaqueData {
    // pub id: i32,
    pub codigo: i32,
    pub nombre: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TipoEmpaqueResponse {
    pub id: i32,
    pub codigo: i32,
    pub nombre: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl From<tipo_empaque::Model> for TipoEmpaqueResponse {
    fn from(model: tipo_empaque::Model) -> Self {
        TipoEmpaqueResponse {
            id: model.id,
            codigo: model.codigo,
            nombre: model.nombre,
            created_at: model.created_at.map(|dt| dt.to_string()),
            updated_at: model.updated_at.map(|dt| dt.to_string()),
        }
    }
}

#[tauri::command]
pub async fn post_tipo_empaque(
    app_handle: AppHandle,
    data: TipoEmpaqueData,
) -> Result<String, String> {
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

    let tipo_empaque = tipo_empaque::ActiveModel {
        codigo: Set(data.codigo),
        nombre: Set(data.nombre),
        ..Default::default()
    };

    let res = match TipoEmpaque::insert(tipo_empaque).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al insertar tipo de empaque: {}", e);
            return Err(format!("Error de inserción: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Tipo de empaque creado correctamente con ID: {}",
        res.last_insert_id
    ))
}

#[tauri::command]
pub async fn get_tipo_empaque(app_handle: AppHandle) -> Result<Vec<TipoEmpaqueResponse>, String> {
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

    let tipos_empaque = match TipoEmpaque::find().all(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al buscar tipos de empaque: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let res = tipos_empaque
        .into_iter()
        .map(TipoEmpaqueResponse::from)
        .collect();

    drop(connection);

    Ok(res)
}

#[tauri::command]
pub async fn get_tipo_empaque_by_id(
    app_handle: AppHandle,
    id: i32,
) -> Result<Option<TipoEmpaqueResponse>, String> {
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

    let tipo_empaque = match TipoEmpaque::find_by_id(id).one(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al buscar tipo de empaque por ID: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let res = tipo_empaque.map(TipoEmpaqueResponse::from);

    drop(connection);

    Ok(res)
}

#[tauri::command]
pub async fn put_tipo_empaque(
    app_handle: AppHandle,
    id: i32,
    data: TipoEmpaqueData,
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

    let tipo_empaque_existente: Model = match TipoEmpaque::find_by_id(id).one(&connection).await {
        Ok(Some(t)) => t,
        Ok(None) => {
            return Err(format!("No existe un tipo de empaque con ID: {}", id));
        }
        Err(e) => {
            println!("Error al buscar tipo de empaque: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let mut tipo_empaque_actualizado: tipo_empaque::ActiveModel = tipo_empaque_existente.into();

    tipo_empaque_actualizado.codigo = Set(data.codigo);
    tipo_empaque_actualizado.nombre = Set(data.nombre);

    let res = match tipo_empaque_actualizado.update(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al actualizar tipo de empaque: {}", e);
            return Err(format!("Error de actualización: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Tipo de empaque actualizado correctamente con ID: {}",
        res.id
    ))
}

#[tauri::command]
pub async fn delete_tipo_empaque(app_handle: AppHandle, id: i32) -> Result<String, String> {
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

    let res = match TipoEmpaque::delete_by_id(id).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al eliminar tipo de empaque: {}", e);
            return Err(format!("Error de eliminación: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Tipo de empaque eliminado correctamente. Filas afectadas: {}",
        res.rows_affected
    ))
}

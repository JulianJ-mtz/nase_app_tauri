use crate::entities::prelude::*;
use crate::entities::tipo_uva::Model;
use crate::entities::*;
use crate::APP_STATE;
use app_lib::obt_connection;
// use rust_decimal::Decimal;
use sea_orm::prelude::*;
use sea_orm::*;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct TipoUvaData {
    // pub id: i32,
    pub codigo: i32,
    pub nombre: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TipoUvaResponse {
    pub id: i32,
    pub codigo: i32,
    pub nombre: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl From<tipo_uva::Model> for TipoUvaResponse {
    fn from(model: tipo_uva::Model) -> Self {
        TipoUvaResponse {
            id: model.id,
            codigo: model.codigo,
            nombre: model.nombre,
            created_at: model.created_at.map(|dt| dt.to_string()),
            updated_at: model.updated_at.map(|dt| dt.to_string()),
        }
    }
}

#[tauri::command]
pub async fn post_tipo_uva(app_handle: AppHandle, data: TipoUvaData) -> Result<String, String> {
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

    let tipo_uva = tipo_uva::ActiveModel {
        codigo: Set(data.codigo),
        nombre: Set(data.nombre),
        ..Default::default()
    };

    let res = match TipoUva::insert(tipo_uva).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al insertar tipo de uva: {}", e);
            return Err(format!("Error de inserción: {}", e));
        }
    };

    drop(connection);

    Ok(format!("Tipo de uva creado correctamente con ID: {}", res.last_insert_id))
}

#[tauri::command]
pub async fn get_tipo_uva(app_handle: AppHandle) -> Result<Vec<TipoUvaResponse>, String> {
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

    let tipos_uva = match TipoUva::find().all(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al buscar tipos de uva: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let res = tipos_uva.into_iter().map(TipoUvaResponse::from).collect();

    drop(connection);

    Ok(res)
}

#[tauri::command]
pub async fn get_tipo_uva_by_id(app_handle: AppHandle, id: i32) -> Result<Option<TipoUvaResponse>, String> {
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

    let tipo_uva = match TipoUva::find_by_id(id).one(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al buscar tipo de uva por ID {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let res: Option<TipoUvaResponse> = tipo_uva.map(TipoUvaResponse::from);

    drop(connection);

    Ok(res)
}

#[tauri::command]
pub async fn put_tipo_uva(
    app_handle: AppHandle,
    id: i32,
    data: TipoUvaData,
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

    let tipo_uva_existente: Model = match TipoUva::find_by_id(id).one(&connection).await {
        Ok(Some(t)) => t,
        Ok(None) => {
            return Err(format!("No existe un tipo de uva con ID: {}", id));
        }
        Err(e) => {
            println!("Error al buscar tipo de uva: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let mut tipo_uva_actualizado: tipo_uva::ActiveModel = tipo_uva_existente.into();

    tipo_uva_actualizado.codigo = Set(data.codigo);
    tipo_uva_actualizado.nombre = Set(data.nombre);

    let res = match tipo_uva_actualizado.update(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al actualizar tipo de uva: {}", e);
            return Err(format!("Error de actualización: {}", e));
        }
    };

    drop(connection);

    Ok(format!("Tipo de uva actualizado correctamente con ID: {}", res.id))
}

#[tauri::command]
pub async fn delete_tipo_uva(app_handle: AppHandle, id: i32) -> Result<String, String> {
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

    let res = match TipoUva::delete_by_id(id).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al eliminar tipo de uva: {}", e);
            return Err(format!("Error de eliminación: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Tipo de uva eliminado correctamente. Filas afectadas: {}",
        res.rows_affected
    ))
}

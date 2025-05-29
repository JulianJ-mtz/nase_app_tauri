use crate::entities::cliente::Model;
use crate::entities::prelude::*;
use crate::entities::*;
use crate::APP_STATE;
use app_lib::obt_connection;
use sea_orm::prelude::*;
use sea_orm::*;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct ClienteData {
    pub id: i32,
    pub codigo: i32,
    pub nombre: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClienteResponse {
    pub id: i32,
    pub codigo: i32,
    pub nombre: String,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl From<cliente::Model> for ClienteResponse {
    fn from(model: cliente::Model) -> Self {
        ClienteResponse {
            id: model.id,
            codigo: model.codigo,
            nombre: model.nombre,
            created_at: model.created_at.map(|dt| dt.to_string()),
            updated_at: model.updated_at.map(|dt| dt.to_string()),
        }
    }
}

#[tauri::command]
pub async fn post_cliente(app_handle: AppHandle, data: ClienteData) -> Result<String, String> {
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

    let cliente = cliente::ActiveModel {
        codigo: Set(data.codigo),
        nombre: Set(data.nombre),
        ..Default::default()
    };

    let res = match Cliente::insert(cliente).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al insertar cliente: {}", e);
            return Err(format!("Error de inserción: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Cliente creado correctamente con ID: {}",
        res.last_insert_id
    ))
}

#[tauri::command]
pub async fn get_cliente(app_handle: AppHandle) -> Result<Vec<ClienteResponse>, String> {
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

    let clientes = match Cliente::find().all(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al buscar clientes: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let res = clientes.into_iter().map(ClienteResponse::from).collect();

    drop(connection);

    Ok(res)
}

#[tauri::command]
pub async fn get_cliente_by_id(
    app_handle: AppHandle,
    id: i32,
) -> Result<Option<ClienteResponse>, String> {
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

    let cliente = match Cliente::find_by_id(id).one(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al buscar cliente por ID: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let res = cliente.map(ClienteResponse::from);

    drop(connection);

    Ok(res)
}

#[tauri::command]
pub async fn put_cliente(
    app_handle: AppHandle,
    id: i32,
    data: ClienteData,
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

    let cliente_existente: Model = match Cliente::find_by_id(id).one(&connection).await {
        Ok(Some(t)) => t,
        Ok(None) => {
            return Err(format!("No existe un cliente con ID: {}", id));
        }
        Err(e) => {
            println!("Error al buscar cliente: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let mut cliente_actualizado: cliente::ActiveModel = cliente_existente.into();

    cliente_actualizado.codigo = Set(data.codigo);
    cliente_actualizado.nombre = Set(data.nombre);

    let res = match cliente_actualizado.update(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al actualizar cliente: {}", e);
            return Err(format!("Error de actualización: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Cliente actualizado correctamente con ID: {}",
        res.id
    ))
}

#[tauri::command]
pub async fn delete_cliente(app_handle: AppHandle, id: i32) -> Result<String, String> {
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

    let res = match Cliente::delete_by_id(id).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al eliminar cliente: {}", e);
            return Err(format!("Error de eliminación: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Cliente eliminado correctamente. Filas afectadas: {}",
        res.rows_affected
    ))
}

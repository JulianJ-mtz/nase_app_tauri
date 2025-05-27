use crate::entities::prelude::*;
use crate::entities::*;
use crate::APP_STATE;
use app_lib::obt_connection;
use sea_orm::prelude::*;
use sea_orm::*;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct ProduccionData {
    pub jornalero_id: i32,
    pub temporada_id: i32,
    pub variedad: String,
    pub lote: String,
    pub empaque: String,
    pub tipo: String,
    pub cantidad: Decimal, // Use Decimal as defined in the entity
    pub fecha: Date,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProduccionResponse {
    pub id: i32,
    pub jornalero_id: i32,
    pub temporada_id: i32,
    pub variedad: String,
    pub lote: String,
    pub empaque: String,
    pub tipo: String,
    pub cantidad: Decimal,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl From<produccion::Model> for ProduccionResponse {
    fn from(model: produccion::Model) -> Self {
        ProduccionResponse {
            id: model.id,
            jornalero_id: model.jornalero_id,
            temporada_id: model.temporada_id,
            variedad: model.variedad,
            lote: model.lote,
            empaque: model.empaque,
            tipo: model.tipo,
            cantidad: model.cantidad,
            created_at: model.created_at.map(|dt| dt.to_string()),
            updated_at: model.updated_at.map(|dt| dt.to_string()),
        }
    }
}

// Example command to insert a new production record
#[tauri::command]
pub async fn post_produccion(
    app_handle: AppHandle,
    data: ProduccionData,
) -> Result<String, String> {
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

    let produccion = produccion::ActiveModel {
        id: ActiveValue::NotSet,
        jornalero_id: ActiveValue::Set(data.jornalero_id),
        temporada_id: ActiveValue::Set(data.temporada_id),
        variedad: ActiveValue::Set(data.variedad),
        lote: ActiveValue::Set(data.lote),
        empaque: ActiveValue::Set(data.empaque),
        tipo: ActiveValue::Set(data.tipo),
        cantidad: ActiveValue::Set(data.cantidad),
        fecha: ActiveValue::Set(data.fecha),
        created_at: ActiveValue::NotSet,
        updated_at: ActiveValue::NotSet,
    };

    let res = match Produccion::insert(produccion).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al insertar producción: {}", e);
            return Err(format!("Error de inserción: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Produccion insertada con ID: {}",
        res.last_insert_id
    ))
}

#[tauri::command]
pub async fn get_produccion(app_handle: AppHandle) -> Result<Vec<ProduccionResponse>, String> {
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

    let producciones = match Produccion::find().all(&connection).await {
        Ok(producciones) => producciones,
        Err(e) => {
            println!("Error al obtener producciones: {}", e);
            return Err(format!("Error al obtener producciones: {}", e));
        }
    };

    let res = producciones
        .into_iter()
        .map(ProduccionResponse::from)
        .collect();

    drop(connection);

    Ok(res)
}

#[tauri::command]
pub async fn get_produccion_by_id(
    app_handle: AppHandle,
    id: i32,
) -> Result<Option<ProduccionResponse>, String> {
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

    let produccion = match Produccion::find_by_id(id).one(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Eror al buscar produccion por ID {}", e);
            return Err(format!("Error de busqueda: {}", e));
        }
    };

    let res: Option<ProduccionResponse> = produccion.map(ProduccionResponse::from);

    drop(connection);

    Ok(res)
}

#[tauri::command]
pub async fn put_produccion(
    app_handle: AppHandle,
    id: i32,
    data: ProduccionData,
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

    let produccion_existente: produccion::Model =
        match Produccion::find_by_id(id).one(&connection).await {
            Ok(Some(c)) => c,
            Ok(None) => {
                return Err(format!("No existe una produccion con ID: {}", id));
            }
            Err(e) => {
                println!("Error al buscar produccion: {}", e);
                return Err(format!("Error de busqueda: {}", e));
            }
        };

    let mut produccion_actulizada: produccion::ActiveModel = produccion_existente.into();

    produccion_actulizada.jornalero_id = ActiveValue::Set(data.jornalero_id);
    produccion_actulizada.temporada_id = ActiveValue::Set(data.temporada_id);
    produccion_actulizada.variedad = ActiveValue::Set(data.variedad);
    produccion_actulizada.lote = ActiveValue::Set(data.lote);
    produccion_actulizada.empaque = ActiveValue::Set(data.empaque);
    produccion_actulizada.tipo = ActiveValue::Set(data.tipo);
    produccion_actulizada.cantidad = ActiveValue::Set(data.cantidad);
    produccion_actulizada.fecha = ActiveValue::Set(data.fecha);

    let res = match produccion_actulizada.update(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al actualizar produccion: {}", e);
            return Err(format!("Error de actualización: {}", e));
        }
    };

    drop(connection);

    Ok(format!("Produccion ID: {} actualizado con éxito", res.id))
}

#[tauri::command]
pub async fn delete_produccion(app_handle: AppHandle, id: i32) -> Result<String, String> {
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

    let res = match Produccion::delete_by_id(id).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al eliminar produccion: {}", e);
            return Err(format!("Error de eliminación: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Produccion ID: {} eliminado con éxito",
        res.rows_affected
    ))
}

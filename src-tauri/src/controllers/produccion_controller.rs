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
    pub cuadrilla_id: i32,
    pub temporada_id: i32,
    // pub lote: String,
    pub cantidad: Decimal, // Use Decimal as defined in the entity
    pub fecha: Date,
    // pub variedad_id: Option<i32>,
    pub tipo_empaque_id: Option<i32>,
    pub tipo_uva_id: Option<i32>,
    pub cliente_id: Option<i32>,
    pub cajas_no_aceptadas: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProduccionResponse {
    pub id: i32,
    pub cuadrilla_id: i32,
    pub temporada_id: i32,
    pub cantidad: Decimal,
    pub fecha: String,
    pub tipo_empaque_id: Option<i32>,
    pub tipo_uva_id: Option<i32>,
    pub cliente_id: Option<i32>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub cajas_no_aceptadas: Option<i32>,
}

impl From<produccion::Model> for ProduccionResponse {
    fn from(model: produccion::Model) -> Self {
        ProduccionResponse {
            id: model.id,
            cuadrilla_id: model.cuadrilla_id,
            temporada_id: model.temporada_id,
            cantidad: model.cantidad,
            fecha: model.fecha.to_string(),
            created_at: model.created_at.map(|dt| dt.to_string()),
            updated_at: model.updated_at.map(|dt| dt.to_string()),
            tipo_empaque_id: model.tipo_empaque_id,
            tipo_uva_id: model.tipo_uva_id,
            cliente_id: model.cliente_id,
            cajas_no_aceptadas: model.cajas_no_aceptadas,
        }
    }
}

// Example command to insert a new production record
#[tauri::command]
pub async fn post_produccion(
    app_handle: AppHandle,
    data: ProduccionData,
) -> Result<ProduccionResponse, String> {
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
        cuadrilla_id: ActiveValue::Set(data.cuadrilla_id),
        temporada_id: ActiveValue::Set(data.temporada_id),
        // lote: ActiveValue::Set(data.lote),
        cantidad: ActiveValue::Set(data.cantidad.clone()),
        fecha: ActiveValue::Set(data.fecha),
        created_at: ActiveValue::NotSet,
        updated_at: ActiveValue::NotSet,
        // variedad_id: ActiveValue::Set(data.variedad_id),
        tipo_empaque_id: ActiveValue::Set(data.tipo_empaque_id),
        tipo_uva_id: ActiveValue::Set(data.tipo_uva_id),
        cliente_id: ActiveValue::Set(data.cliente_id),
        cajas_no_aceptadas: ActiveValue::Set(data.cajas_no_aceptadas),
    };

    let res = match Produccion::insert(produccion).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al insertar producción: {}", e);
            return Err(format!("Error de inserción: {}", e));
        }
    };

    // Obtener el registro recién insertado
    let nueva_produccion = match Produccion::find_by_id(res.last_insert_id)
        .one(&connection)
        .await
    {
        Ok(Some(produccion)) => produccion,
        Ok(None) => {
            return Err("No se pudo encontrar la producción recién insertada".to_string());
        }
        Err(e) => {
            println!("Error al obtener la producción insertada: {}", e);
            return Err(format!("Error al obtener la producción insertada: {}", e));
        }
    };

    drop(connection);

    Ok(ProduccionResponse::from(nueva_produccion))
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
) -> Result<ProduccionResponse, String> {
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

    // Actualizar el registro de producción
    let mut produccion_actualizada: produccion::ActiveModel = produccion_existente.into();

    produccion_actualizada.cuadrilla_id = ActiveValue::Set(data.cuadrilla_id);
    produccion_actualizada.temporada_id = ActiveValue::Set(data.temporada_id);
    // produccion_actualizada.lote = ActiveValue::Set(data.lote);
    produccion_actualizada.cantidad = ActiveValue::Set(data.cantidad.clone());
    produccion_actualizada.fecha = ActiveValue::Set(data.fecha);
    // produccion_actualizada.variedad_id = ActiveValue::Set(data.variedad_id);
    produccion_actualizada.tipo_empaque_id = ActiveValue::Set(data.tipo_empaque_id);
    produccion_actualizada.tipo_uva_id = ActiveValue::Set(data.tipo_uva_id);
    produccion_actualizada.cliente_id = ActiveValue::Set(data.cliente_id);
    produccion_actualizada.cajas_no_aceptadas = ActiveValue::Set(data.cajas_no_aceptadas);

    let res = match produccion_actualizada.update(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al actualizar produccion: {}", e);
            return Err(format!("Error de actualización: {}", e));
        }
    };

    drop(connection);

    Ok(ProduccionResponse::from(res))
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

    // Eliminar el registro de producción
    let res = match Produccion::delete_by_id(id).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al eliminar produccion: {}", e);
            return Err(format!("Error de eliminación: {}", e));
        }
    };

    drop(connection);

    if res.rows_affected > 0 {
        Ok(format!("Produccion ID: {} eliminado con éxito", id))
    } else {
        Err(format!("No se encontró una producción con ID: {}", id))
    }
}

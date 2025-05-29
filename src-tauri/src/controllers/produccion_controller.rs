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
    pub lote: String,
    pub cantidad: Decimal, // Use Decimal as defined in the entity
    pub fecha: Date,
    pub variedad_id: Option<i32>,
    pub tipo_empaque_id: Option<i32>,
    pub tipo_uva_id: Option<i32>,
    pub cliente_id: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProduccionResponse {
    pub id: i32,
    pub jornalero_id: i32,
    pub temporada_id: i32,
    pub lote: String,
    pub cantidad: Decimal,
    pub variedad_id: Option<i32>,
    pub tipo_empaque_id: Option<i32>,
    pub tipo_uva_id: Option<i32>,
    pub cliente_id: Option<i32>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl From<produccion::Model> for ProduccionResponse {
    fn from(model: produccion::Model) -> Self {
        ProduccionResponse {
            id: model.id,
            jornalero_id: model.jornalero_id,
            temporada_id: model.temporada_id,
            lote: model.lote,

            cantidad: model.cantidad,
            created_at: model.created_at.map(|dt| dt.to_string()),
            updated_at: model.updated_at.map(|dt| dt.to_string()),
            variedad_id: model.variedad_id,
            tipo_empaque_id: model.tipo_empaque_id,
            tipo_uva_id: model.tipo_uva_id,
            cliente_id: model.cliente_id,
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
        lote: ActiveValue::Set(data.lote),
        cantidad: ActiveValue::Set(data.cantidad.clone()),
        fecha: ActiveValue::Set(data.fecha),
        created_at: ActiveValue::NotSet,
        updated_at: ActiveValue::NotSet,
        variedad_id: ActiveValue::Set(data.variedad_id),
        tipo_empaque_id: ActiveValue::Set(data.tipo_empaque_id),
        tipo_uva_id: ActiveValue::Set(data.tipo_uva_id),
        cliente_id: ActiveValue::Set(data.cliente_id),
    };

    let res = match Produccion::insert(produccion).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al insertar producción: {}", e);
            return Err(format!("Error de inserción: {}", e));
        }
    };

    // Actualizar la producción del jornalero
    let jornalero = match Jornalero::find_by_id(data.jornalero_id).one(&connection).await {
        Ok(Some(j)) => j,
        Ok(None) => {
            return Err(format!("No existe un jornalero con ID: {}", data.jornalero_id));
        }
        Err(e) => {
            println!("Error al buscar jornalero: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    // Obtener la producción actual del jornalero y sumar la nueva cantidad
    let produccion_actual = jornalero.produccion_jornalero.unwrap_or_else(|| Decimal::new(0, 0));
    let nueva_produccion = produccion_actual + data.cantidad.clone();
    
    let mut jornalero_actualizado: jornalero::ActiveModel = jornalero.into();
    jornalero_actualizado.produccion_jornalero = ActiveValue::Set(Some(nueva_produccion));

    match jornalero_actualizado.update(&connection).await {
        Ok(_) => (),
        Err(e) => {
            println!("Error al actualizar producción del jornalero: {}", e);
            return Err(format!("Error al actualizar producción del jornalero: {}", e));
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

    // Si el jornalero ha cambiado o la cantidad ha cambiado, necesitamos actualizar las producciones
    let jornalero_id_anterior = produccion_existente.jornalero_id;
    let cantidad_anterior = produccion_existente.cantidad.clone();
    
    // Actualizar el registro de producción
    let mut produccion_actualizada: produccion::ActiveModel = produccion_existente.into();

    produccion_actualizada.jornalero_id = ActiveValue::Set(data.jornalero_id);
    produccion_actualizada.temporada_id = ActiveValue::Set(data.temporada_id);
    produccion_actualizada.lote = ActiveValue::Set(data.lote);
    produccion_actualizada.cantidad = ActiveValue::Set(data.cantidad.clone());
    produccion_actualizada.fecha = ActiveValue::Set(data.fecha);
    produccion_actualizada.variedad_id = ActiveValue::Set(data.variedad_id);
    produccion_actualizada.tipo_empaque_id = ActiveValue::Set(data.tipo_empaque_id);
    produccion_actualizada.tipo_uva_id = ActiveValue::Set(data.tipo_uva_id);
    produccion_actualizada.cliente_id = ActiveValue::Set(data.cliente_id);

    let res = match produccion_actualizada.update(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al actualizar produccion: {}", e);
            return Err(format!("Error de actualización: {}", e));
        }
    };

    // Si el jornalero ha cambiado, actualizamos ambos jornaleros
    if jornalero_id_anterior != data.jornalero_id {
        // Restar la cantidad anterior del jornalero anterior
        let jornalero_anterior = match Jornalero::find_by_id(jornalero_id_anterior).one(&connection).await {
            Ok(Some(j)) => j,
            Ok(None) => {
                return Err(format!("No existe el jornalero anterior con ID: {}", jornalero_id_anterior));
            }
            Err(e) => {
                println!("Error al buscar jornalero anterior: {}", e);
                return Err(format!("Error de búsqueda: {}", e));
            }
        };

        let produccion_anterior = jornalero_anterior.produccion_jornalero.unwrap_or_else(|| Decimal::new(0, 0));
        let nueva_produccion_anterior = if produccion_anterior > cantidad_anterior {
            produccion_anterior - cantidad_anterior
        } else {
            Decimal::new(0, 0)
        };

        let mut jornalero_anterior_actualizado: jornalero::ActiveModel = jornalero_anterior.into();
        jornalero_anterior_actualizado.produccion_jornalero = ActiveValue::Set(Some(nueva_produccion_anterior));

        match jornalero_anterior_actualizado.update(&connection).await {
            Ok(_) => (),
            Err(e) => {
                println!("Error al actualizar producción del jornalero anterior: {}", e);
                return Err(format!("Error al actualizar producción del jornalero anterior: {}", e));
            }
        };

        // Sumar la nueva cantidad al nuevo jornalero
        let jornalero_nuevo = match Jornalero::find_by_id(data.jornalero_id).one(&connection).await {
            Ok(Some(j)) => j,
            Ok(None) => {
                return Err(format!("No existe el jornalero nuevo con ID: {}", data.jornalero_id));
            }
            Err(e) => {
                println!("Error al buscar jornalero nuevo: {}", e);
                return Err(format!("Error de búsqueda: {}", e));
            }
        };

        let produccion_nuevo = jornalero_nuevo.produccion_jornalero.unwrap_or_else(|| Decimal::new(0, 0));
        let nueva_produccion_nuevo = produccion_nuevo + data.cantidad;

        let mut jornalero_nuevo_actualizado: jornalero::ActiveModel = jornalero_nuevo.into();
        jornalero_nuevo_actualizado.produccion_jornalero = ActiveValue::Set(Some(nueva_produccion_nuevo));

        match jornalero_nuevo_actualizado.update(&connection).await {
            Ok(_) => (),
            Err(e) => {
                println!("Error al actualizar producción del jornalero nuevo: {}", e);
                return Err(format!("Error al actualizar producción del jornalero nuevo: {}", e));
            }
        };
    } else if cantidad_anterior != data.cantidad {
        // Si solo cambió la cantidad, actualizar la producción del jornalero
        let jornalero = match Jornalero::find_by_id(data.jornalero_id).one(&connection).await {
            Ok(Some(j)) => j,
            Ok(None) => {
                return Err(format!("No existe un jornalero con ID: {}", data.jornalero_id));
            }
            Err(e) => {
                println!("Error al buscar jornalero: {}", e);
                return Err(format!("Error de búsqueda: {}", e));
            }
        };

        let produccion_actual = jornalero.produccion_jornalero.unwrap_or_else(|| Decimal::new(0, 0));
        // Restar la cantidad anterior y sumar la nueva
        let nueva_produccion = if produccion_actual >= cantidad_anterior {
            produccion_actual - cantidad_anterior + data.cantidad
        } else {
            data.cantidad
        };

        let mut jornalero_actualizado: jornalero::ActiveModel = jornalero.into();
        jornalero_actualizado.produccion_jornalero = ActiveValue::Set(Some(nueva_produccion));

        match jornalero_actualizado.update(&connection).await {
            Ok(_) => (),
            Err(e) => {
                println!("Error al actualizar producción del jornalero: {}", e);
                return Err(format!("Error al actualizar producción del jornalero: {}", e));
            }
        };
    }

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

    // Primero obtenemos el registro de producción para saber qué jornalero y cantidad actualizar
    let produccion = match Produccion::find_by_id(id).one(&connection).await {
        Ok(Some(p)) => p,
        Ok(None) => {
            return Err(format!("No existe una producción con ID: {}", id));
        }
        Err(e) => {
            println!("Error al buscar producción: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    // Guardar los datos necesarios antes de eliminar
    let jornalero_id = produccion.jornalero_id;
    let cantidad = produccion.cantidad.clone();

    // Eliminar el registro de producción
    let res = match Produccion::delete_by_id(id).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al eliminar produccion: {}", e);
            return Err(format!("Error de eliminación: {}", e));
        }
    };

    // Actualizar la producción del jornalero restando la cantidad eliminada
    let jornalero = match Jornalero::find_by_id(jornalero_id).one(&connection).await {
        Ok(Some(j)) => j,
        Ok(None) => {
            return Err(format!("No existe un jornalero con ID: {}", jornalero_id));
        }
        Err(e) => {
            println!("Error al buscar jornalero: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    let produccion_actual = jornalero.produccion_jornalero.unwrap_or_else(|| Decimal::new(0, 0));
    let nueva_produccion = if produccion_actual >= cantidad {
        produccion_actual - cantidad
    } else {
        Decimal::new(0, 0)
    };

    let mut jornalero_actualizado: jornalero::ActiveModel = jornalero.into();
    jornalero_actualizado.produccion_jornalero = ActiveValue::Set(Some(nueva_produccion));

    match jornalero_actualizado.update(&connection).await {
        Ok(_) => (),
        Err(e) => {
            println!("Error al actualizar producción del jornalero: {}", e);
            return Err(format!("Error al actualizar producción del jornalero: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Produccion ID: {} eliminado con éxito",
        res.rows_affected
    ))
}

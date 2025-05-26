use crate::entities::prelude::*;
use crate::entities::*;
use crate::APP_STATE;
use app_lib::obt_connection;
use sea_orm::prelude::*;
use sea_orm::*;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct JornaleroData {
    pub nombre: String,
    pub edad: i32,
    pub estado: String,
    pub fecha_contratacion: String, // Formato YYYY-MM-DD
    pub produccion_jornalero: Option<Decimal>,
    pub errores: Option<i32>,
    pub cuadrilla_id: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JornaleroResponse {
    pub id: i32,
    pub nombre: String,
    pub edad: i32,
    pub estado: String,
    pub fecha_contratacion: String,
    pub produccion_jornalero: Option<Decimal>,
    pub errores: Option<i32>,
    pub cuadrilla_id: Option<i32>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl From<jornalero::Model> for JornaleroResponse {
    fn from(model: jornalero::Model) -> Self {
        Self {
            id: model.id,
            nombre: model.nombre,
            edad: model.edad,
            estado: model.estado,
            fecha_contratacion: model.fecha_contratacion.to_string(),
            produccion_jornalero: model.produccion_jornalero,
            errores: model.errores,
            cuadrilla_id: model.cuadrilla_id,
            created_at: model.created_at.map(|dt| dt.to_string()),
            updated_at: model.updated_at.map(|dt| dt.to_string()),
        }
    }
}

#[tauri::command]
pub async fn post_jornalero(app_handle: AppHandle, data: JornaleroData) -> Result<String, String> {
    // Incrementar contador para debug
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de inserción #{}", state.operation_count);
    }

    // Obtener conexión a la base de datos
    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    // Parsear la fecha
    let fecha_contratacion = match Date::from_str(&data.fecha_contratacion) {
        Ok(date) => date,
        Err(e) => return Err(format!("Fecha inválida: {}", e)),
    };

    let jornalero = jornalero::ActiveModel {
        id: ActiveValue::NotSet,
        nombre: ActiveValue::Set(data.nombre),
        edad: ActiveValue::Set(data.edad),
        estado: ActiveValue::Set(data.estado),
        fecha_contratacion: ActiveValue::Set(fecha_contratacion),
        produccion_jornalero: ActiveValue::Set(data.produccion_jornalero),
        errores: ActiveValue::Set(data.errores),
        cuadrilla_id: ActiveValue::Set(data.cuadrilla_id),
        created_at: ActiveValue::NotSet,
        updated_at: ActiveValue::NotSet,
    };

    // Ejecutar inserción
    let res = match Jornalero::insert(jornalero).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al insertar jornalero: {}", e);
            return Err(format!("Error de inserción: {}", e));
        }
    };

    // Cerrar la conexión explícitamente (aunque sea innecesario)
    drop(connection);

    Ok(format!(
        "Jornalero insertado con ID: {}",
        res.last_insert_id
    ))
}

#[tauri::command]
pub async fn get_jornaleros(app_handle: AppHandle) -> Result<Vec<JornaleroResponse>, String> {
    // Incrementar contador para debug
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de consulta #{}", state.operation_count);
    }

    // Obtener conexión
    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    // Ejecutar consulta
    let jornaleros = match Jornalero::find().all(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al consultar jornaleros: {}", e);
            return Err(format!("Error de consulta: {}", e));
        }
    };

    // Cerrar conexión
    drop(connection);

    // Convertir los modelos a la respuesta serializable
    let response = jornaleros
        .into_iter()
        .map(JornaleroResponse::from)
        .collect();

    Ok(response)
}

#[tauri::command]
pub async fn get_jornalero_by_id(
    app_handle: AppHandle,
    id: i32,
) -> Result<Option<JornaleroResponse>, String> {
    // Incrementar contador para debug
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!("Operación de búsqueda por ID #{}", state.operation_count);
    }

    // Obtener conexión
    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    // Ejecutar consulta
    let jornalero = match Jornalero::find_by_id(id).one(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al buscar jornalero por ID: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    // Cerrar conexión
    drop(connection);

    // Convertir el modelo a la respuesta serializable si existe
    let response = jornalero.map(JornaleroResponse::from);

    Ok(response)
}

#[tauri::command]
pub async fn put_jornalero(
    app_handle: AppHandle,
    id: i32,
    data: JornaleroData,
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

    // Verificar que el jornalero existe
    let jornalero_existente = match Jornalero::find_by_id(id).one(&connection).await {
        Ok(Some(j)) => j,
        Ok(None) => {
            return Err(format!("No existe un jornalero con ID: {}", id));
        }
        Err(e) => {
            println!("Error al buscar jornalero: {}", e);
            return Err(format!("Error de búsqueda: {}", e));
        }
    };

    // Parsear la fecha
    let fecha_contratacion = match Date::from_str(&data.fecha_contratacion) {
        Ok(date) => date,
        Err(e) => return Err(format!("Fecha inválida: {}", e)),
    };

    // Crear el modelo activo para actualizar
    let mut jornalero_actualizado: jornalero::ActiveModel = jornalero_existente.into();

    // Actualizar los campos
    jornalero_actualizado.nombre = ActiveValue::Set(data.nombre);
    jornalero_actualizado.edad = ActiveValue::Set(data.edad);
    jornalero_actualizado.estado = ActiveValue::Set(data.estado);
    jornalero_actualizado.fecha_contratacion = ActiveValue::Set(fecha_contratacion);
    jornalero_actualizado.produccion_jornalero = ActiveValue::Set(data.produccion_jornalero);
    jornalero_actualizado.errores = ActiveValue::Set(data.errores);
    jornalero_actualizado.cuadrilla_id = ActiveValue::Set(data.cuadrilla_id);

    // Ejecutar actualización
    let res = match jornalero_actualizado.update(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al actualizar jornalero: {}", e);
            return Err(format!("Error de actualización: {}", e));
        }
    };

    // Cerrar la conexión explícitamente
    drop(connection);

    Ok(format!("Jornalero ID: {} actualizado con éxito", res.id))
}

#[tauri::command]
pub async fn delete_jornalero(app_handle: AppHandle, id: i32) -> Result<String, String> {
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

    let res = match Jornalero::delete_by_id(id).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al eliminar jornalero: {}", e);
            return Err(format!("Error de eliminación: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Jornalero ID: {} eliminado con éxito",
        res.rows_affected
    ))
}

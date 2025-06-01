use crate::entities::cuadrilla::Model;
use crate::entities::prelude::*;
use crate::entities::*;
use crate::APP_STATE;
use app_lib::obt_connection;
use sea_orm::prelude::*;
use sea_orm::*;
use serde::{Deserialize, Serialize};
// use std::str::FromStr;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct CuadrillaData {
    pub id: Option<i32>,
    pub lider_cuadrilla_id: Option<i32>,
    // pub produccion_cuadrilla: Option<Decimal>,
    pub lote: String,
    pub variedad_id: Option<i32>,
    // pub empaque: Option<String>,
    // pub integrantes: Option<i32>,
    pub temporada_id: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CuadrillaResponse {
    pub id: i32,
    pub lider_cuadrilla_id: Option<i32>,
    // pub produccion_cuadrilla: Option<Decimal>,
    pub lote: String,
    pub variedad_id: Option<i32>,
    // pub empaque: Option<String>,
    // pub integrantes: Option<i32>,
    pub temporada_id: Option<i32>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl From<cuadrilla::Model> for CuadrillaResponse {
    fn from(model: cuadrilla::Model) -> Self {
        CuadrillaResponse {
            id: model.id,
            lider_cuadrilla_id: model.lider_cuadrilla_id,
            lote: model.lote,
            variedad_id: model.variedad_id,
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
        lider_cuadrilla_id: ActiveValue::Set(data.lider_cuadrilla_id),
        lote: ActiveValue::Set(data.lote),
        variedad_id: ActiveValue::Set(data.variedad_id),
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

    let cuadrilla_id = res.last_insert_id;

    // Si hay un líder asignado, actualizarlo para que pertenezca a esta cuadrilla
    if let Some(lider_id) = data.lider_cuadrilla_id {
        let jornalero_lider = match crate::entities::jornalero::Entity::find_by_id(lider_id)
            .one(&connection)
            .await
        {
            Ok(Some(j)) => j,
            Ok(None) => {
                println!(
                    "Advertencia: No se encontró el jornalero líder con ID: {}",
                    lider_id
                );
                drop(connection);
                return Ok(format!(
                    "Cuadrilla insertada con ID: {} (advertencia: jornalero líder no encontrado)",
                    cuadrilla_id
                ));
            }
            Err(e) => {
                println!("Error al buscar jornalero líder: {}", e);
                drop(connection);
                return Err(format!("Error al buscar jornalero líder: {}", e));
            }
        };

        let mut jornalero_lider_actualizado: crate::entities::jornalero::ActiveModel =
            jornalero_lider.into();
        jornalero_lider_actualizado.cuadrilla_id = sea_orm::ActiveValue::Set(Some(cuadrilla_id));

        if let Err(e) = jornalero_lider_actualizado.update(&connection).await {
            println!("Error al asignar líder a la cuadrilla: {}", e);
            drop(connection);
            return Err(format!("Error al asignar líder a la cuadrilla: {}", e));
        }
    }

    drop(connection);

    Ok(format!("Cuadrilla insertada con ID: {}", cuadrilla_id))
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

    // Si hay un cambio de líder, necesitamos actualizar los jornaleros
    if cuadrilla_existente.lider_cuadrilla_id != data.lider_cuadrilla_id {
        // Si había un líder anterior, desasignarlo de la cuadrilla
        if let Some(lider_anterior_id) = cuadrilla_existente.lider_cuadrilla_id {
            if let Ok(Some(jornalero_anterior)) =
                crate::entities::jornalero::Entity::find_by_id(lider_anterior_id)
                    .one(&connection)
                    .await
            {
                let mut jornalero_anterior_actualizado: crate::entities::jornalero::ActiveModel =
                    jornalero_anterior.into();
                jornalero_anterior_actualizado.cuadrilla_id = sea_orm::ActiveValue::Set(None);

                if let Err(e) = jornalero_anterior_actualizado.update(&connection).await {
                    println!("Error al desasignar líder anterior: {}", e);
                }
            } else {
                println!(
                    "Advertencia: No se encontró el jornalero anterior con ID: {}",
                    lider_anterior_id
                );
            }
        }

        // Si hay un nuevo líder, asignarlo a la cuadrilla
        if let Some(nuevo_lider_id) = data.lider_cuadrilla_id {
            let jornalero_nuevo =
                match crate::entities::jornalero::Entity::find_by_id(nuevo_lider_id)
                    .one(&connection)
                    .await
                {
                    Ok(Some(j)) => j,
                    Ok(None) => {
                        return Err(format!("No existe un jornalero con ID: {}", nuevo_lider_id));
                    }
                    Err(e) => {
                        println!("Error al buscar nuevo líder: {}", e);
                        return Err(format!("Error al buscar nuevo líder: {}", e));
                    }
                };

            let mut jornalero_nuevo_actualizado: crate::entities::jornalero::ActiveModel =
                jornalero_nuevo.into();
            jornalero_nuevo_actualizado.cuadrilla_id = sea_orm::ActiveValue::Set(Some(id));

            if let Err(e) = jornalero_nuevo_actualizado.update(&connection).await {
                println!("Error al asignar nuevo líder: {}", e);
                return Err(format!("Error al asignar nuevo líder: {}", e));
            }
        }
    }

    let mut cuadrilla_actualizada: cuadrilla::ActiveModel = cuadrilla_existente.into();

    cuadrilla_actualizada.lider_cuadrilla_id = ActiveValue::Set(data.lider_cuadrilla_id);
    cuadrilla_actualizada.lote = ActiveValue::Set(data.lote);
    cuadrilla_actualizada.variedad_id = ActiveValue::Set(data.variedad_id);
    cuadrilla_actualizada.temporada_id = ActiveValue::Set(data.temporada_id);

    let res = match cuadrilla_actualizada.update(&connection).await {
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

    // Verificar si hay registros de producción asociados
    let produccion_count = match crate::entities::produccion::Entity::find()
        .filter(crate::entities::produccion::Column::CuadrillaId.eq(id))
        .count(&connection)
        .await
    {
        Ok(count) => count,
        Err(e) => {
            println!("Error al verificar producción: {}", e);
            return Err(format!("Error al verificar dependencias: {}", e));
        }
    };

    if produccion_count > 0 {
        return Err(format!(
            "No se puede eliminar la cuadrilla porque tiene {} registro(s) de producción asociados. Use la eliminación forzada para proceder.",
            produccion_count
        ));
    }

    // Verificar si hay jornaleros asignados (para mostrar warning pero permitir eliminación)
    let jornaleros_count = match crate::entities::jornalero::Entity::find()
        .filter(crate::entities::jornalero::Column::CuadrillaId.eq(id))
        .count(&connection)
        .await
    {
        Ok(count) => count,
        Err(e) => {
            println!("Error al verificar jornaleros: {}", e);
            return Err(format!("Error al verificar jornaleros: {}", e));
        }
    };

    // Preparar el mensaje de respuesta
    let mut success_message = format!("Cuadrilla ID: {} eliminada con éxito", id);

    if jornaleros_count > 0 {
        success_message = format!(
            "Cuadrilla ID: {} eliminada con éxito. {} jornalero(s) fueron removidos de la cuadrilla y están ahora disponibles para reasignación",
            id, jornaleros_count
        );
    }

    // Proceder con la eliminación - la relación on_delete="SetNull" manejará automáticamente los jornaleros
    let res = match Cuadrilla::delete_by_id(id).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al eliminar cuadrilla: {}", e);
            return Err(format!("Error de eliminación: {}", e));
        }
    };

    drop(connection);

    if res.rows_affected > 0 {
        Ok(success_message)
    } else {
        Err("No se pudo eliminar la cuadrilla".to_string())
    }
}

#[tauri::command]
pub async fn force_delete_cuadrilla(app_handle: AppHandle, id: i32) -> Result<String, String> {
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!(
            "Operación de eliminación forzada #{}",
            state.operation_count
        );
    }

    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    let mut messages = Vec::new();

    let res = match Cuadrilla::delete_by_id(id).exec(&connection).await {
        Ok(result) => result,
        Err(e) => {
            println!("Error al eliminar cuadrilla: {}", e);
            return Err(format!("Error de eliminación: {}", e));
        }
    };

    drop(connection);

    if res.rows_affected > 0 {
        messages.push(format!("Cuadrilla ID: {} eliminada exitosamente", id));
        Ok(messages.join(". "))
    } else {
        Err("No se pudo eliminar la cuadrilla".to_string())
    }
}

#[tauri::command]
pub async fn reassign_jornaleros_from_cuadrilla(
    app_handle: AppHandle,
    id: i32,
) -> Result<String, String> {
    {
        let mut state = APP_STATE.lock().unwrap();
        state.operation_count += 1;
        println!(
            "Operación de reasignación de jornaleros #{}",
            state.operation_count
        );
    }

    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    // Verificar cuántos jornaleros están asignados a esta cuadrilla
    let jornaleros_count = match crate::entities::jornalero::Entity::find()
        .filter(crate::entities::jornalero::Column::CuadrillaId.eq(id))
        .count(&connection)
        .await
    {
        Ok(count) => count,
        Err(e) => {
            println!("Error al verificar jornaleros: {}", e);
            return Err(format!("Error al verificar jornaleros: {}", e));
        }
    };

    if jornaleros_count == 0 {
        return Ok("No hay jornaleros asignados a esta cuadrilla".to_string());
    }

    // Reasignar jornaleros (quitar de la cuadrilla)
    let jornaleros_updated = match crate::entities::jornalero::Entity::update_many()
        .col_expr(
            crate::entities::jornalero::Column::CuadrillaId,
            Expr::value(Value::Int(None)),
        )
        .filter(crate::entities::jornalero::Column::CuadrillaId.eq(id))
        .exec(&connection)
        .await
    {
        Ok(result) => result.rows_affected,
        Err(e) => {
            println!("Error al reasignar jornaleros: {}", e);
            return Err(format!("Error al reasignar jornaleros: {}", e));
        }
    };

    drop(connection);

    Ok(format!(
        "Se reasignaron {} jornalero(s) de la cuadrilla",
        jornaleros_updated
    ))
}

#[tauri::command]
pub async fn get_cuadrilla_delete_warning(
    app_handle: AppHandle,
    id: i32,
) -> Result<String, String> {
    let connection = match obt_connection(&app_handle).await {
        Ok(conn) => conn,
        Err(e) => {
            println!("Error al conectar a la base de datos: {}", e);
            return Err(format!("Error de conexión: {}", e));
        }
    };

    // Verificar si hay registros de producción asociados
    let produccion_count = match crate::entities::produccion::Entity::find()
        .filter(crate::entities::produccion::Column::CuadrillaId.eq(id))
        .count(&connection)
        .await
    {
        Ok(count) => count,
        Err(e) => {
            println!("Error al verificar producción: {}", e);
            return Err(format!("Error al verificar dependencias: {}", e));
        }
    };

    // Verificar si hay jornaleros asignados
    let jornaleros_count = match crate::entities::jornalero::Entity::find()
        .filter(crate::entities::jornalero::Column::CuadrillaId.eq(id))
        .count(&connection)
        .await
    {
        Ok(count) => count,
        Err(e) => {
            println!("Error al verificar jornaleros: {}", e);
            return Err(format!("Error al verificar jornaleros: {}", e));
        }
    };

    drop(connection);

    // Construir mensaje de warning
    let mut warnings = Vec::new();

    if jornaleros_count > 0 {
        warnings.push(format!("{} jornalero(s) serán removidos de la cuadrilla y quedarán disponibles para reasignación", jornaleros_count));
    }

    if produccion_count > 0 {
        warnings.push(format!(
            "{} registro(s) de producción están asociados - se requiere eliminación forzada",
            produccion_count
        ));
    }

    if warnings.is_empty() {
        Ok("La cuadrilla se puede eliminar sin problemas.".to_string())
    } else {
        Ok(format!("Advertencias: {}", warnings.join(". ")))
    }
}

use wasm_bindgen::prelude::*;
use rhai::{Engine, Dynamic, OptimizationLevel};
use serde_json::json;

/// Create a new Rhai engine with full optimizations and decimal support
fn create_engine() -> Engine {
    let mut engine = Engine::new();
    
    // Enable full script optimization for maximum performance
    engine.set_optimization_level(OptimizationLevel::Full);

    engine
}

/// Convert a Rhai Dynamic value to JSON
fn rhai_dynamic_to_json(value: &Dynamic) -> Result<serde_json::Value, Box<rhai::EvalAltResult>> {
    use serde_json::Value;

    // Handle unit type (empty result)
    if value.is::<()>() {
        return Ok(Value::Null);
    }

    // Try to cast to different types
    if let Some(int_val) = value.clone().try_cast::<i64>() {
        Ok(json!(int_val))
    } else if let Some(float_val) = value.clone().try_cast::<f64>() {
        Ok(json!(float_val))
    } else if let Some(bool_val) = value.clone().try_cast::<bool>() {
        Ok(json!(bool_val))
    } else if let Some(string_val) = value.clone().try_cast::<String>() {
        Ok(json!(string_val))
    } else if let Some(array_val) = value.clone().try_cast::<rhai::Array>() {
        let json_array: Result<Vec<serde_json::Value>, _> = array_val.iter()
            .map(|item| rhai_dynamic_to_json(item))
            .collect();
        Ok(Value::Array(json_array?))
    } else if let Some(map_val) = value.clone().try_cast::<rhai::Map>() {
        let mut json_map = serde_json::Map::new();
        for (key, val) in map_val {
            let json_value = rhai_dynamic_to_json(&val)?;
            json_map.insert(key.to_string(), json_value);
        }
        Ok(Value::Object(json_map))
    } else {
        // For any other type, try to convert to string as fallback
        Ok(json!(value.to_string()))
    }
}

/// Evaluate Rhai script code and return the result as a JSON string
/// 
/// # Arguments
/// * `code` - The Rhai script code to evaluate
/// 
/// # Returns
/// * JSON string representation of the result, or error message if evaluation fails
#[wasm_bindgen]
pub fn run_rhai(code: &str) -> String {
    let engine = create_engine();
    
    match engine.eval::<Dynamic>(code) {
        Ok(result) => {
            match rhai_dynamic_to_json(&result) {
                Ok(json_value) => json_value.to_string(),
                Err(e) => format!("Error converting to JSON: {}", e),
            }
        },
        Err(e) => format!("Error: {}", e),
    }
}

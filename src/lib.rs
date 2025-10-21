use wasm_bindgen::prelude::*;
use rhai::{Engine, Dynamic, OptimizationLevel, Scope};
use serde_json::{json, Value};

#[cfg(test)]
mod tests;

/// Get the version of the WASM module for debugging
#[wasm_bindgen]
pub fn get_version() -> String {
    "v0.2.0-debug".to_string()
}

/// Create a new Rhai engine with full optimizations and decimal support
fn create_engine() -> Engine {
    let mut engine = Engine::new();
    
    // Enable full script optimization for maximum performance
    engine.set_optimization_level(OptimizationLevel::Full);

    engine
}

/// Core Rhai evaluation logic - separated from WASM bindings for testing
pub fn evaluate_rhai_with_json(code: &str, json_input: Option<&str>) -> Result<String, String> {
    let engine = create_engine();
    let mut scope = Scope::new();
    
    // Parse and register JSON input as 'request' variable if provided
    if let Some(json_str) = json_input {
        match serde_json::from_str::<Value>(json_str) {
            Ok(json_value) => {
                let request_dynamic = rhai_json_to_dynamic(&json_value);
                scope.set_or_push("request", request_dynamic);
            },
            Err(e) => {
                return Err(format!("Error parsing JSON input: {}", e));
            }
        }
    }
    
    match engine.eval_with_scope::<Dynamic>(&mut scope, code) {
        Ok(result) => {
            match rhai_dynamic_to_json(&result) {
                Ok(json_value) => Ok(json_value.to_string()),
                Err(e) => Err(format!("Error converting to JSON: {}", e)),
            }
        },
        Err(e) => Err(format!("Error: {}", e)),
    }
}

/// Convert JSON value to Rhai Dynamic
fn rhai_json_to_dynamic(value: &serde_json::Value) -> Dynamic {
    match value {
        serde_json::Value::Null => Dynamic::UNIT,
        serde_json::Value::Bool(b) => Dynamic::from(*b),
        serde_json::Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                // Convert to i32 to match Rhai's default integer type
                Dynamic::from(i as i32)
            } else if let Some(f) = n.as_f64() {
                Dynamic::from(f)
            } else {
                Dynamic::from(n.to_string())
            }
        },
        serde_json::Value::String(s) => Dynamic::from(s.clone()),
        serde_json::Value::Array(arr) => {
            let rhai_array: rhai::Array = arr.iter()
                .map(|item| rhai_json_to_dynamic(item))
                .collect();
            Dynamic::from(rhai_array)
        },
        serde_json::Value::Object(obj) => {
            let mut rhai_map = rhai::Map::new();
            for (key, val) in obj {
                rhai_map.insert(key.clone().into(), rhai_json_to_dynamic(val));
            }
            Dynamic::from(rhai_map)
        },
    }
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

/// Evaluate Rhai script code with optional JSON input and return the result as a JSON string
/// 
/// # Arguments
/// * `code` - The Rhai script code to evaluate
/// * `json_input` - Optional JSON string to be made available as `request` variable in the script
/// 
/// # Returns
/// * JSON string representation of the result, or error message if evaluation fails
#[wasm_bindgen]
pub fn run_rhai(code: &str, json_input: Option<String>) -> String {
    match evaluate_rhai_with_json(code, json_input.as_deref()) {
        Ok(result) => result,
        Err(error) => error,
    }
}

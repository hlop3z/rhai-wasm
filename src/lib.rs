use wasm_bindgen::prelude::*;
use rhai::{Engine, Dynamic, OptimizationLevel};

/// Create a new Rhai engine with full optimizations and decimal support
fn create_engine() -> Engine {
    let mut engine = Engine::new();
    
    // Enable full script optimization for maximum performance
    engine.set_optimization_level(OptimizationLevel::Full);

    engine
}

/// Evaluate Rhai script code and return the result as a string
/// 
/// # Arguments
/// * `code` - The Rhai script code to evaluate
/// 
/// # Returns
/// * String representation of the result, or error message if evaluation fails
#[wasm_bindgen]
pub fn run_rhai(code: &str) -> String {
    let engine = create_engine();
    
    match engine.eval::<Dynamic>(code) {
        Ok(result) => format!("{}", result),
        Err(e) => format!("Error: {}", e),
    }
}

#[cfg(test)]
mod tests {
    use crate::evaluate_rhai_with_json;

    #[test]
    fn test_simple_script() {
        let result = evaluate_rhai_with_json("1 + 2", None);
        assert_eq!(result, Ok("\"3\"".to_string()));
    }

    #[test]
    fn test_script_with_json_input() {
        let json_input = r#"{"name": "Alice", "age": 30}"#;
        let code = "request.name";
        let result = evaluate_rhai_with_json(code, Some(json_input));
        assert_eq!(result, Ok("\"Alice\"".to_string()));
    }

    #[test]
    fn test_script_with_json_object_output() {
        let json_input = r#"{"user": "Alice", "id": 42}"#;
        let code = r#"#{ user: request.user, id: request.id + 1 }"#;
        let result = evaluate_rhai_with_json(code, Some(json_input));
        // The result should contain the expected values, order may vary
        assert!(result.is_ok());
        let result_str = result.unwrap();
        assert!(result_str.contains("\"user\":\"Alice\""));
        assert!(result_str.contains("\"id\":\"43\""));
    }

    #[test]
    fn test_script_without_json_input() {
        let code = "request";
        let result = evaluate_rhai_with_json(code, None);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Variable not found"));
    }

    #[test]
    fn test_invalid_json_input() {
        let json_input = r#"{"name": "Alice", "age": }"#; // Invalid JSON
        let code = "request.name";
        let result = evaluate_rhai_with_json(code, Some(json_input));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Error parsing JSON input"));
    }

    #[test]
    fn test_complex_json_structure() {
        let json_input = r#"{
            "user": {
                "name": "Alice",
                "age": 30,
                "active": true
            },
            "items": [1, 2, 3],
            "metadata": null
        }"#;
        let code = r#"#{
            name: request.user.name,
            age: request.user.age,
            active: request.user.active,
            item_count: request.items.len(),
            has_metadata: request.metadata != ()
        }"#;
        let result = evaluate_rhai_with_json(code, Some(json_input));
        assert!(result.is_ok());
        let result_str = result.unwrap();
        assert!(result_str.contains("\"name\":\"Alice\""));
        assert!(result_str.contains("\"age\":\"30\""));
        assert!(result_str.contains("\"active\":true"));
        assert!(result_str.contains("\"item_count\":\"3\""));
        assert!(result_str.contains("\"has_metadata\":false"));
    }
}

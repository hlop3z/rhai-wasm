// ------------------------------------------------------------
// Helper functions for dynamic object management
// ------------------------------------------------------------

/// Checks if a value is a function
fn is_function(val) {
  return type_of(val) == "Fn"
}

/// Creates a snapshot of an object, resolving all functions
/// by calling them with the object as `self`.
/// Non-function fields are copied directly.
fn get_fields(obj) {
  let new_obj = #{};             
  for key in obj.keys() {
      const val = obj[key];
      if is_function(val) {
          new_obj[key] = val.call(obj);  // call method with obj as self
      } else {
          new_obj[key] = val;           // copy value
      }
  }
  return new_obj;
}

/// Merges given values into an object and returns a snapshot
/// resolving all functions to their return values.
/// This is useful for rendering or extracting current data.
fn resolver(obj, values) {
  // Merge values into obj
  for key in values.keys() {
      const val = values[key];
      obj[key] = val;           // update or add field
  }
  // Return snapshot with resolved functions
  return get_fields(obj);
}

// ------------------------------------------------------------
// Usage Example
// ------------------------------------------------------------

let none = ();  // placeholder for empty fields

// Define a model with data fields and computed properties
let model = #{
  name: none,
  last: none,
  full_name: |self| { return self.name + " " + self.last }
};

// Update the model with new values and get a snapshot for rendering
let snapshot = resolver(model, request);

return snapshot;


//print(snapshot); // #{"full_name":"john doe","last":"doe","name":"john"}
//print(model);    // #{"full_name": Fn(), "last": (), "name": ()}

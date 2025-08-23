# API Error Handling

## Overview
The Laravel API now includes comprehensive error handling that converts all API errors into a standardized JSON format. This ensures consistent error responses across all API endpoints.

## Standard Error Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "errors": []
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": { /* detailed error information */ },
  "data": null
}
```

## Exception Types Handled

### 1. Validation Errors (422)
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "title": ["The title field is required."],
    "email": ["The email must be a valid email address."]
  },
  "data": null
}
```

### 2. Model Not Found (404)
```json
{
  "success": false,
  "message": "Task not found.",
  "errors": [],
  "data": null
}
```

### 3. Route Not Found (404)
```json
{
  "success": false,
  "message": "The requested resource was not found.",
  "errors": [],
  "data": null
}
```

### 4. Method Not Allowed (405)
```json
{
  "success": false,
  "message": "The specified method for the request is invalid.",
  "errors": [],
  "data": null
}
```

### 5. Unauthenticated (401)
```json
{
  "success": false,
  "message": "Unauthenticated.",
  "errors": [],
  "data": null
}
```

### 6. Unauthorized/Forbidden (403)
```json
{
  "success": false,
  "message": "This action is unauthorized.",
  "errors": [],
  "data": null
}
```

### 7. Invalid Arguments (400)
```json
{
  "success": false,
  "message": "Invalid status value: invalid_status",
  "errors": [],
  "data": null
}
```

### 8. Database Errors (500)

#### Development Environment
```json
{
  "success": false,
  "message": "Database error: SQLSTATE[23505]: Unique violation...",
  "errors": {
    "database": "SQLSTATE[23505]: Unique violation...",
    "sql": "INSERT INTO users...",
    "bindings": ["John", "john@example.com"]
  },
  "data": null
}
```

#### Production Environment
```json
{
  "success": false,
  "message": "A database error occurred.",
  "errors": [],
  "data": null
}
```

### 9. Generic Server Errors (500)

#### Development Environment
```json
{
  "success": false,
  "message": "Call to undefined method...",
  "errors": {
    "exception": "Error",
    "file": "/path/to/file.php",
    "line": 42,
    "trace": [
      {
        "file": "/path/to/file.php",
        "line": 42,
        "function": "undefinedMethod",
        "class": "App\\SomeClass"
      }
    ]
  },
  "data": null
}
```

#### Production Environment
```json
{
  "success": false,
  "message": "An unexpected error occurred.",
  "errors": [],
  "data": null
}
```

## Implementation Files

### 1. ApiExceptionHandler (`app/Exceptions/ApiExceptionHandler.php`)
- Main exception handler class
- Contains methods for handling specific exception types
- Provides helper methods for consistent responses

### 2. Bootstrap Configuration (`bootstrap/app.php`)
- Registers the custom exception handler
- Only processes API routes (routes starting with `api/`)

### 3. Updated Controllers
- `TaskController` - Uses standardized responses
- `UserController` - Uses standardized responses

## Usage in Controllers

### Success Response
```php
use App\Http\Responses\ApiStdResponse;

return ApiStdResponse::successResponse(
    $data,
    'Operation successful',
    200
);
```

### Error Response
```php
use App\Http\Responses\ApiStdResponse;

return ApiStdResponse::errorResponse(
    'Something went wrong',
    400,
    ['field' => ['error message']]
);
```

## Environment-Specific Behavior

### Development (`APP_ENV=local`)
- Detailed error messages
- Stack traces included
- SQL queries and bindings shown for database errors

### Production (`APP_ENV=production`)
- Generic error messages
- No sensitive information exposed
- Stack traces hidden

## Benefits

1. **Consistency**: All API errors follow the same format
2. **Frontend Friendly**: Predictable error structure for easier handling
3. **Security**: Sensitive information hidden in production
4. **Debugging**: Detailed information available in development
5. **Type Safety**: Specific handling for different exception types
6. **Maintainability**: Centralized error handling logic

## Testing Error Responses

You can test different error scenarios:

```bash
# 404 - Route not found
curl http://localhost:8081/api/nonexistent

# 404 - Model not found  
curl http://localhost:8081/api/tasks/999999

# 405 - Method not allowed
curl -X POST http://localhost:8081/api/tasks/1

# 422 - Validation error
curl -X POST http://localhost:8081/api/tasks \
  -H "Content-Type: application/json" \
  -d '{}'
```

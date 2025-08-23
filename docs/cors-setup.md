# CORS Configuration

## Overview
The Laravel API has been configured to support Cross-Origin Resource Sharing (CORS) for frontend applications running on different ports and domains.

## Allowed Origins
The following origins are allowed to make requests to the API:

### Static Origins
- `http://localhost:3000` - Primary frontend URL
- `http://localhost:3001` - Alternative frontend URL
- `http://127.0.0.1:3000` - IPv4 localhost variant
- `http://127.0.0.1:3001` - IPv4 localhost variant

### Pattern-Based Origins
The following patterns are also allowed:
- `/^http:\/\/localhost:\d+$/` - Any port on localhost
- `/^http:\/\/127\.0\.0\.1:\d+$/` - Any port on 127.0.0.1
- `/^https?:\/\/.*\.localhost:\d+$/` - Subdomain variants on localhost

## Configuration Files
- **CORS Config**: `apps/api/config/cors.php`
- **Environment**: `apps/api/.env`

## Environment Variables
```env
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_ALT=http://localhost:3001
```

## Allowed Headers
The API accepts the following headers:
- `Accept`
- `Authorization`
- `Content-Type`
- `X-Requested-With`
- `X-CSRF-TOKEN`
- `X-XSRF-TOKEN`

## Exposed Headers
The API exposes these headers for pagination:
- `X-Pagination-Current-Page`
- `X-Pagination-Per-Page`
- `X-Pagination-Total`

## Testing CORS
To test CORS functionality, use the following curl command when the server is running:

```bash
curl -I \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://localhost:8081/api/tasks
```

## Starting the API Server
```bash
# From the root directory
make up

# Or alternatively
cd apps/api && ./vendor/bin/sail up -d
```

## Credentials Support
CORS is configured with `supports_credentials: true`, which means:
- Cookies, authorization headers, and TLS client certificates can be sent
- Frontend must use `credentials: 'include'` in fetch requests
- `withCredentials: true` in axios requests

## API Paths Covered
CORS is enabled for:
- `api/*` - All API routes
- `sanctum/csrf-cookie` - CSRF token endpoint
- `storage/*` - File storage endpoints

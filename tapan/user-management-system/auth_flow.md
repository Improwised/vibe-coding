# Authentication & Authorization Flow

## 1. Login Sequence
```mermaid
sequenceDiagram
    User->>Client: Enters credentials
    Client->>API: POST /api/auth/login
    API->>Database: Verify credentials
    Database-->>API: User data
    API->>API: Generate JWT
    API-->>Client: {token, user}
    Client->>Client: Store token
```

## 2. JWT Structure
- Header: 
  ```json
  {
    "alg": "HS256",
    "typ": "JWT"
  }
  ```
- Payload:
  ```json
  {
    "sub": "user_id",
    "role_id": "role_id",
    "iat": 1516239022,
    "exp": 1516242622
  }
  ```
- Signature: HMAC SHA256

## 3. Protected Request Flow
```mermaid
sequenceDiagram
    Client->>API: Request with JWT
    API->>API: Verify JWT signature
    API->>API: Check expiration
    API->>API: Validate role permissions
    alt Valid
        API-->>Client: Requested data
    else Invalid
        API-->>Client: 401/403 Error
    end
```

## 4. Token Refresh Flow
- Client monitors token expiration
- When nearing expiry (5 min remaining):
  ```mermaid
  sequenceDiagram
      Client->>API: POST /api/auth/refresh
      API->>API: Validate current token
      API-->>Client: New token
  ```

## 5. Error Handling
| Scenario | Status | Response |
|----------|--------|----------|
| Invalid credentials | 401 | `{"error": "Invalid credentials"}` |
| Expired token | 401 | `{"error": "Token expired"}` |
| Missing token | 401 | `{"error": "Authentication required"}` |
| Insufficient permissions | 403 | `{"error": "Insufficient permissions"}` |

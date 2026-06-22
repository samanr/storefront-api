# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

## API Endpoints

### Products

| Method | Route                      | Auth Required | Description              |
|--------|----------------------------|---------------|--------------------------|
| GET    | `/api/products`            | No            | List all products        |
| GET    | `/api/products/:id`        | No            | Get a single product     |
| POST   | `/api/products`            | Yes           | Create a new product     |
| GET    | `/api/products/popular`    | No            | Top N popular products   |
| GET    | `/api/products?category=X` | No            | Filter products by category |

#### GET `/api/products`
```json
Response 200:
{ "data": [{ "id": 1, "name": "string", "price": 0, "category": "string" }] }
```

#### GET `/api/products/:id`
```json
Response 200:
{ "data": { "id": 1, "name": "string", "price": 0, "category": "string" } }
```

#### POST `/api/products` [token required]
```json
Request:
{ "name": "string", "price": 0, "category": "string" }

Response 201:
{ "data": { "id": 1, "name": "string", "price": 0, "category": "string" } }
```

#### GET `/api/products/popular?count=5` [OPTIONAL]
```json
Response 200:
{ "data": [{ "id": 1, "name": "string", "price": 0, "category": "string", "total_sold": 10 }] }
```

#### GET `/api/products?category=books` [OPTIONAL]
```json
Response 200:
{ "data": [{ "id": 1, "name": "string", "price": 0, "category": "books" }] }
```

---

### Users

| Method | Route           | Auth Required | Description          |
|--------|-----------------|---------------|----------------------|
| GET    | `/api/users`    | Yes           | List all users       |
| GET    | `/api/users/:id`| Yes           | Get a single user    |
| POST   | `/api/users`    | Yes           | Create a new user    |

#### GET `/api/users` [token required]
```json
Response 200:
{ "data": [{ "id": 1, "first_name": "string", "last_name": "string" }] }
```

#### GET `/api/users/:id` [token required]
```json
Response 200:
{ "data": { "id": 1, "first_name": "string", "last_name": "string" } }
```

#### POST `/api/users` [token required]
```json
Request:
{ "first_name": "string", "last_name": "string", "password": "string" }

Response 201:
{ "message": "User created" }
```

---

### Authentication

| Method | Route        | Auth Required | Description              |
|--------|--------------|---------------|--------------------------|
| POST   | `/api/login` | No            | Login and receive a JWT  |

#### POST `/api/login`
```json
Request:
{ "first_name": "string", "last_name": "string", "password": "string" }

Response 200:
{ "token": "jwt-token-string" }
```

---

### Orders

| Method | Route        | Auth Required | Description                        |
|--------|--------------|---------------|------------------------------------|
| POST   | `/api/orders`| Yes           | Add product to order (create if none exists) |
| GET    | `/api/orders?userId=123&status=active` | Yes | Get order by user and status |

#### POST `/api/orders` [token required]
```json
Request:
{ "product_id": 1, "quantity": 2 }

Response 201:
{
    "data": {
        "id": 1,
        "user_id": 1,
        "status": "active",
        "products": [
            { "id": 1, "name": "string", "price": 0, "category": "string", "quantity": 2 }
        ]
    }
}
```

#### GET `/api/orders?userId=123&status=active` [token required]
```json
Response 200:
{
    "data": {
        "id": 1,
        "user_id": 1,
        "status": "active",
        "products": [
            { "id": 1, "name": "string", "price": 0, "category": "string", "quantity": 1 }
        ]
    }
}
```

---

## Error Responses

All endpoints return errors in the following shape:
```json
{ "error": "descriptive message" }
```

| Status Code | Meaning                          |
|-------------|----------------------------------|
| 400         | Bad Request — invalid input      |
| 401         | Unauthorized — missing or invalid token |
| 404         | Not Found — resource does not exist |
| 500         | Internal Server Error            |

---

## Data Shapes

### Product
| Column     | Type    | Notes         |
|------------|---------|---------------|
| id         | integer | auto-generated |
| name       | string  | required      |
| price      | integer | required      |
| category   | string  | optional      |

### User
| Column     | Type    | Notes                     |
|------------|---------|---------------------------|
| id         | integer | auto-generated            |
| first_name | string  | required                  |
| last_name  | string  | required                  |
| password   | string  | stored as bcrypt hash     |

### Orders
| Column  | Type    | Notes                        |
|---------|---------|------------------------------|
| id      | integer | auto-generated               |
| user_id | integer | foreign key → users.id       |
| status  | enum    | `active` or `complete`       |

### Order Products (junction table)
| Column     | Type    | Notes                        |
|------------|---------|------------------------------|
| id         | integer | auto-generated               |
| order_id   | integer | foreign key → orders.id      |
| product_id | integer | foreign key → products.id    |
| quantity   | integer | required                     |

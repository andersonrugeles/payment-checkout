# Backend API — Payment Checkout

REST API built with NestJS + TypeScript for managing payment transactions.

## Features

- Product catalog with stock management
- Transaction processing (create, get, refresh status)
- Integration with payment gateway (tokenization + transactions)
- Input validation with class-validator
- Comprehensive unit tests (>80% coverage)

## Prerequisites

- Node.js 22+
- npm 10+

## Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.template .env
# Fill in the .env file with your payment API keys

# Run in development mode
npm run start:dev
```

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /products | List all products |
| GET | /products/:id | Get product by ID |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /transactions | Create a new transaction |
| GET | /transactions | List all transactions |
| GET | /transactions/:id | Get transaction by ID |
| PATCH | /transactions/:id/refresh | Refresh transaction status |

### Create Transaction Body
```json
{
  "customerEmail": "customer@email.com",
  "items": [
    { "productId": "1", "quantity": 1 }
  ],
  "cardData": {
    "number": "4242424242424242",
    "cvc": "123",
    "exp_month": "12",
    "exp_year": "29",
    "card_holder": "Test User"
  },
  "installments": 1
}
```

## Running Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Coverage Results
- Statements: 94.44%
- Branches: 71.27%
- Functions: 96.55%
- Lines: 94.44%

## Docker

```bash
# Build image
docker build -t payment-api .

# Run container
docker run -p 3000:3000 --env-file .env payment-api
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 3000) |
| PAYMENT_API_URL | Payment gateway API URL |
| PAYMENT_PUBLIC_KEY | Public key for tokenization |
| PAYMENT_PRIVATE_KEY | Private key for transactions |

## Architecture

```
src/
├── products/          # Product catalog module
├── transactions/      # Transaction management module
├── payment/           # Payment gateway integration
└── common/            # Shared utilities
```

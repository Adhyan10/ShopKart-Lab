# ShopKart – Lab 6 (Checkout & Orders)

MERN storefront: products, wishlist, cart, checkout with Razorpay (test mode) and order history.

## Setup

Requirements: Node 18+, a MongoDB Atlas cluster, Razorpay **test** keys.

```bash
# backend
cd backend
cp .env.example .env      # then fill in the values below
npm install
npm run seed              # fetches products from the DummyJSON API into MongoDB
npm start                 # http://localhost:5001

# frontend (second terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

### backend/.env

| Variable | Purpose |
|---|---|
| `MONGO_URI` | Atlas connection string (include the `/shopkart` database name) |
| `JWT_SECRET` | Long random string used to sign login tokens |
| `RAZORPAY_KEY_ID` | `rzp_test_...` key id (also sent to the browser) |
| `RAZORPAY_KEY_SECRET` | Test key secret. Backend only, never commit it |
| `PORT` | Optional, defaults to 5001 |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis keys for rate limiting (30 requests/minute per IP on `/auth` and `/orders`) |
| `CLIENT_ORIGIN` | Optional. Allowed browser origin for CORS (set it in production) |
| `ENABLE_PRODUCT_CREATE` | Optional. `true` enables `POST /products` for local testing only (off by default) |
| `USD_TO_INR` | Optional, price conversion used by the seed (default 83) |

`frontend` reads `VITE_API_URL` (default `http://localhost:5001`).

## Products

Products are not hardcoded. `npm run seed` downloads the catalogue from
`https://dummyjson.com/products` and upserts it by `externalId`, so it is safe to re-run and keeps
product ids stable for existing carts and orders. Prices are converted from USD to INR.

## Checkout flow

1. Cart → **Proceed to Checkout** (`/checkout`), shipping form is validated in the browser.
2. `POST /orders/create-payment-order` – server rebuilds items and total from the user's cart and the
   latest product data (never from the request), checks stock, saves a `PENDING_PAYMENT` order and
   creates the Razorpay order (amount in paise).
3. Razorpay Checkout opens; on success the browser sends the payment id and signature to
   `POST /orders/verify-payment`.
4. The server verifies the HMAC-SHA256 signature using the Razorpay order id it stored, marks the
   order `PAID` / `PLACED`, reduces stock and clears the cart. The frontend then clears its cart state.

| Method | Endpoint | Notes |
|---|---|---|
| POST | `/orders/create-payment-order` | body: `{ shippingAddress }` |
| POST | `/orders/verify-payment` | body: `shopKartOrderId`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` |
| GET | `/orders` | current user's paid orders, newest first |
| GET | `/orders/:id` | 404 if the order is not yours |

### Testing a payment (test mode)

Use the Indian test card `5267 3181 8797 5449`, any future expiry, any CVV, any valid-looking
mobile number and email, then **Pay on bank's page** → **Success** (or **Failure**).
No real money is used.

## Frontend pages

`/login`, `/register`, `/home`, `/products`, `/products/:id`, `/wishlist`, `/cart`, `/checkout`,
`/order-success/:id`, `/orders`, `/orders/:id`, plus a custom 404 page. Contact details in the footer
come from `frontend/src/config/site.js`.

# Student Shop

A simple MERN e-commerce assignment using React, Vite, Bootstrap, Redux Toolkit, Axios, Express and MongoDB.

## Features

- Register, login and logout with JWT and hashed passwords
- Product list, detail page, search, category filter and price sorting
- Redux cart with quantities and cash-on-delivery checkout
- Customer orders and cancellation before shipping
- Admin product management and order status updates
- Profile editing and account deletion
- Contact form with validation and saved messages
- RapidMiner recommendation service connection with category-based fallback

## Run locally

Install Node.js 22 or newer. Use MongoDB Atlas, or a local MongoDB replica set. Order stock updates use MongoDB transactions, so a standalone MongoDB server is not sufficient.

1. Run `npm install` from this folder.
2. Copy `ecommerce-backend/.env.example` to `ecommerce-backend/.env`.
3. Set `MONGO_URI` to your database connection string. Set `JWT_SECRET` to a random secret of at least 32 characters.
4. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` if you want to create an admin account. Use a password of at least 8 characters.
5. Copy `ecommerce-frontend/.env.example` to `ecommerce-frontend/.env`.
6. Run `npm run seed` to add sample products and the admin account. It does not delete existing data.
7. Run `npm run server` in one terminal.
8. Run `npm run client` in another terminal.
9. Open `http://localhost:5173`.

Register a normal customer from the Login page. Use the admin account to manage products and update orders. Cart contents are kept in Redux for the current page session. Authentication uses session storage and is cleared when the tab is closed. Contact messages are stored in MongoDB; email delivery is not included.

Never commit `.env` files. Keep database passwords and service tokens in environment variables.

## Check the project

`npm run build` builds the frontend.

`npm test` runs API integration tests using a temporary MongoDB replica set. The first test run downloads a MongoDB test binary, so internet access is needed. The temporary database does not use your configured database.

## API routes

| Method | Route | Access |
| --- | --- | --- |
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET, PUT, DELETE | /api/profile | Logged-in account |
| GET | /api/products | Public |
| GET | /api/products/:id | Public |
| POST | /api/products | Admin |
| PUT, DELETE | /api/products/:id | Admin |
| GET, POST | /api/orders | Logged-in account |
| PUT | /api/orders/:id | Customer cancellation or admin status update |
| DELETE | /api/orders/:id | Admin, completed or cancelled orders only |
| GET | /api/recommendations/:id | Public |
| POST | /api/contact | Public |

Product deletion hides the product from the shop. Existing order details are preserved. Customers can only access their own orders. Prices and totals are calculated by the backend.

## RapidMiner setup

The backend includes an adapter for a RapidMiner Web API endpoint. A deployed RapidMiner process and service credentials must be supplied separately; the repository does not include a trained recommendation model or a verified deployed service.

Set `RAPIDMINER_URL` to the deployed endpoint URL and `RAPIDMINER_TOKEN` to its long-lived API token. The backend sends an `Authorization: apitoken ...` header when a token is configured.

Expected input:

```json
{"data":[{"product_id":"mongodb-product-id","category":"Stationery","price":80}]}
```

Configure the process to return recommended product IDs from the same MongoDB catalog:

```json
{"data":[{"recommended_product_id":"mongodb-product-id"}]}
```

The adapter uses RapidMiner's documented `data` envelope. The field names above are this project's process contract and must match your process. The shop shows “Recommended products” when that service responds successfully. If it is not configured or fails, the shop shows “Similar products” from the same category. This fallback does not satisfy the assignment's RapidMiner integration requirement by itself.

See [RapidMiner endpoint documentation](https://docs.rapidminer.com/latest/hub/endpoints/results/index.html).

## Deployment

For a Node web host such as Render, use `ecommerce-backend` as the root folder, `npm install` as the build command and `npm start` as the start command. Configure `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` and the optional RapidMiner variables on the host. Use MongoDB Atlas or another replica set.

For a static host such as Netlify, use `ecommerce-frontend` as the base directory, `npm run build` as the build command and `dist` as the publish directory. Set `VITE_API_URL` to the backend HTTPS URL followed by `/api` before building. The included `_redirects` file supports React Router on Netlify.

Set backend `CLIENT_URL` to the exact deployed frontend origin. A live website still needs to be deployed to your hosting account.

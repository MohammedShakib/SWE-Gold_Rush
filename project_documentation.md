# Gold Rush M - Project Analysis & Documentation

## 1. Project Overview
**Gold Rush M** is a specialized Jewellery Management System designed to digitize the operations of jewellery shops in Bangladesh. It simplifies complex daily tasks such as inventory tracking, sales processing (POS), customer management, and custom manufacturing orders.

The project is built as a **Monorepo** containing:
- **Client**: A React.js (Vite) frontend with a Public Landing Page and a Protected Shop Owner Dashboard.
- **Server**: An Express.js backend using MSSQL, capable of running as a standalone Node server or deployed via **Firebase Functions**.

## 2. Feature Analysis & Interactions
The system relies on a central database (MSSQL) where different modules interact. Below is the analysis of how features currently work and interact:

### 2.1 Sales & Inventory (POS)
- **Flow**: The Shop Owner adds products to a cart and processes a sale.
- **Payment**: Supports **Cash** (immediate completion) and **Online Payment** (SSLCommerz gateway).
- **Interaction**:
  - **Sales Recording**: Successfully creates `sales` and `sale_items` records.
  - **Stock Management**: Currently, there is **NO automatic stock deduction** from the `products` table when a sale is made. Stock quantity must be updated manually in the Inventory module.
  - **Financials**: Sales data drives the Dashboard charts (Revenue, Daily Sales), but relies on manual inventory accuracy.

### 2.2 Manufacturing (Karigar Orders)
- **Flow**: Shop Owners create orders for custom jewellery items, assigning them to artisans (Karigars).
- **Phases**: New Order -> In Progress -> Completed.
- **Interaction**:
  - This module is **standalone**. It tracks the status and gold weight of orders.
  - **Missing Link**: Completing a manufacturing order **does not automatically** create a new item in the Inventory (`products` table). The finished item must be manually added to Inventory if it is to be sold.

### 2.3 Installments & Payments
- **Flow**: Allows creating installment plans for customers for high-value items.
- **Interaction**:
  - Links to `customers` table for identity.
  - **Independent Tracking**: The installment plan tracks `paid_amount` vs `total_amount` independently of the Sales module. It does not automatically generate a "Sale" record when fully paid, acting more as a financial ledger.

### 2.4 Subscriptions (SaaS Model)
- **Flow**: Shop Owners sign up and choose a plan (Free, Monthly, Yearly, Lifetime).
- **Automation**: **Fully Automated**.
  - A successful SSLCommerz payment triggers a webhook that automatically updates the shop owner's `subscription_status` to 'active' and extends the `subscription_end_date`.

### 2.5 Repairs
- **Flow**: Tracks customer items brought in for repair (Issue, Cost, Status).
- **Interaction**: Standalone ticketing system. No inventory linkage (e.g., spare parts usage is not tracked).

## 3. Technology Stack

### Frontend (`/client`)
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS + Vanilla CSS (Premium Gold/Dark Theme)
- **Routing**: React Router DOM (Separate Public/Private Layouts)
- **Auth**: Custom JWT-based auth + Firebase (Google Auth) integration.

### Backend (`/server` & `/functions`)
- **Runtime**: Node.js (Express.js)
- **Database**: Microsoft SQL Server (MSSQL)
- **Hosting**: Configured for Firebase Functions (`goldrushApi`) but also runs as a standard Express server.
- **Payment**: SSLCommerz LTS (Live/Sandbox support)
- **Schema Management**: Auto-healing schema (Backend checks and creates tables/columns on startup if missing).

## 4. Workflows

### User Journey
1.  **Visitor**: Lands on the public homepage -> Views Features/Pricing -> Signs Up.
2.  **Onboarding**: User creates an account (Store Name, Location). If a paid plan is selected, they are redirected to payment. Upon success, they get access to the Dashboard.
3.  **Operation**: User logs in to specific modules (Inventory, Sales, etc.) to manage their shop.

### Data Flow
- **Frontend requests** happen via Axios/Fetch to `/api/*` endpoints.
- **Backend** validates requests -> Connects to MSSQL Pool -> Executes Queries -> Returns JSON.
- **Real-time**: Not currently implemented (client relies on page reloads or local state updates).

## 5. Authentication Methods

### 5.1 Local Authentication (Email/Password)
- **Signup Endpoint**: `POST /api/auth/signup`
  - **Required Fields**: fullName, phone, identifier (email), password, latitude, longitude, shop_name
  - **Optional Fields**: branch_count, tax_id, plan (free/monthly/yearly/lifetime)
  - **Process**: Creates shopowner account, generates unique shopowner_id (e.g., SP-001)
  - **Response**: Returns user object with shopowner_id and optional paymentUrl for paid plans
  - **Note**: Passwords stored in plain text (should be hashed in production)

- **Signin Endpoint**: `POST /api/auth/signin`
  - **Required Fields**: identifier (email), password
  - **Process**: Simple credential verification
  - **Response**: Returns complete user object on success
  - **Note**: No JWT tokens currently implemented

### 5.2 Google OAuth Integration
- **Endpoint**: `POST /api/auth/google`
- **Required Fields**: email, fullName
- **Optional Fields**: photoURL
- **Process**: 
  - Checks if user exists by email
  - If exists, returns user info (login)
  - If new, creates account with dummy password
- **Response**: User object with shopowner details

### 5.3 Authorization Pattern
- **User Identification**: Uses `shopownerId` (e.g., SP-001) or `userId` (numeric ID) in query params or request body
- **No Token System**: Currently no JWT or session-based authentication
- **Data Isolation**: Queries filter by shopowner_id to ensure shop owners only see their own data
- **Example**: `GET /api/inventory?shopownerId=SP-001&branch=Main Branch`

## 6. API Endpoints - Complete Reference

### 6.1 Public Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/blog` | Returns mock blog posts for landing page |
| POST | `/api/contact` | Receives contact form submissions (console logged) |
| GET | `/api/health` | Database health check endpoint |

### 6.2 Authentication Endpoints
| Method | Endpoint | Description | Required Fields |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/signup` | Register new shop owner | fullName, phone, identifier, password, latitude, longitude, shop_name |
| POST | `/api/auth/signin` | Login shop owner | identifier, password |
| POST | `/api/auth/google` | Google OAuth login/signup | email, fullName |

### 6.3 Inventory Management
| Method | Endpoint | Description | Query/Body Params |
| :--- | :--- | :--- | :--- |
| GET | `/api/inventory` | List products by branch | `shopownerId`, `branch` (default: Main Branch) |
| POST | `/api/inventory` | Add new product | name, category, karat, weight, price, stock_quantity, image_url, branch, shopownerId |
| PUT | `/api/inventory/:id` | Update product details | name, category, karat, weight, price, stock_quantity, status |
| DELETE | `/api/inventory/:id` | Delete product | - |

### 6.4 Sales & Payment Processing
| Method | Endpoint | Description | Required Fields |
| :--- | :--- | :--- | :--- |
| GET | `/api/sales` | Get all sales records | `shopownerId`, `branch` |
| GET | `/api/sales/:id` | Get sale details with items | - |
| POST | `/api/payment/init` | Create sale (Cash or SSLCommerz) | cart (array), paymentMethod, shopownerId, branch |
| POST | `/api/payment/success/:tran_id` | Webhook for payment success | (Triggered by SSLCommerz) |
| POST | `/api/payment/fail/:tran_id` | Webhook for payment failure | (Triggered by SSLCommerz) |
| PUT | `/api/sales/:id` | Update sale status | status |
| DELETE | `/api/sales/:id` | Delete sale and associated items | - |

### 6.5 Manufacturing (Karigar Orders)
| Method | Endpoint | Description | Required Fields |
| :--- | :--- | :--- | :--- |
| GET | `/api/manufacturing` | Get manufacturing orders | `shopownerId`, `branch` |
| POST | `/api/manufacturing` | Create new karigar order | order_id, customer_name, product_name, karigar_name, gold_weight, due_date, branch, shopownerId |
| PUT | `/api/manufacturing/:id/status` | Update order status (Drag & Drop) | status (New Orders/In Progress/Completed) |
| DELETE | `/api/manufacturing/:id` | Delete manufacturing order | - |

### 6.6 Customer Relationship Management (CRM)
| Method | Endpoint | Description | Required Fields |
| :--- | :--- | :--- | :--- |
| GET | `/api/customers` | Get customer list | `shopownerId`, `branch` |
| POST | `/api/customers` | Add new customer | name, phone, type, branch, shopownerId |
| PUT | `/api/customers/:id` | Update customer info | name, phone, type |
| DELETE | `/api/customers/:id` | Delete customer profile | - |

### 6.7 Installment Plans
| Method | Endpoint | Description | Required Fields |
| :--- | :--- | :--- | :--- |
| GET | `/api/installments` | Get installment plans | `shopownerId`, `branch` |
| POST | `/api/installments` | Create payment plan | customer_id, item_description, total_amount, paid_amount, due_date, branch, shopownerId |
| GET | `/api/installments/:id/payments` | Get payment history | - |
| POST | `/api/installments/:id/payments` | Record installment payment | amount, payment_method, notes |

### 6.8 Repair Tickets
| Method | Endpoint | Description | Required Fields |
| :--- | :--- | :--- | :--- |
| GET | `/api/repairs` | Get repair tickets | `shopownerId`, `branch` |
| POST | `/api/repairs` | Create repair ticket | customer_name, customer_phone, item_name, issue_description, estimated_cost, due_date, branch, shopownerId |
| PUT | `/api/repairs/:id` | Update repair ticket | status, estimated_cost, delivery_date |
| DELETE | `/api/repairs/:id` | Delete repair ticket | - |

### 6.9 Branch Management
| Method | Endpoint | Description | Required Fields |
| :--- | :--- | :--- | :--- |
| GET | `/api/branches` | Get all branches | `shopownerId` or `userId` |
| POST | `/api/branches` | Create new branch | name, location, shopownerId |
| PUT | `/api/branches/:id` | Update branch details | name, location, daily_sales, stock_value, status |
| DELETE | `/api/branches/:id` | Delete branch | - |

### 6.10 Stock Transfers (Inter-Branch)
| Method | Endpoint | Description | Required Fields |
| :--- | :--- | :--- | :--- |
| GET | `/api/stock-transfers` | Get transfer records | `shopownerId` or `userId` |
| POST | `/api/stock-transfers` | Create stock transfer | from_branch, to_branch, items (JSON), shopownerId |
| PUT | `/api/stock-transfers/:id/status` | Update transfer status | status (Pending/Completed) |

### 6.11 User Profile & Settings
| Method | Endpoint | Description | Required Fields |
| :--- | :--- | :--- | :--- |
| GET | `/api/user-profile` | Get user profile | `shopownerId` or `userId` |
| PUT | `/api/user-profile` | Update profile info | id, full_name, phone, identifier |
| POST | `/api/change-password` | Change password | userId, currentPassword, newPassword |

### 6.12 Subscription Management (SaaS)
| Method | Endpoint | Description | Required Fields |
| :--- | :--- | :--- | :--- |
| POST | `/api/subscription/update` | Update subscription plan | shopownerId, plan (free/monthly/yearly/lifetime), amount |

### 6.13 Payment Gateway Integration
- **Provider**: SSLCommerz (Bangladesh payment gateway)
- **Supported Methods**: Cash, Online Payment (SSLCommerz)
- **Configuration**: 
  - Store ID: `certi6925618cc270e` (Sandbox)
  - Store Password: `certi6925618cc270e@ssl`
  - IS_LIVE: `false` (Currently in test mode)
- **Webhooks**:
  - Success URL: `http://localhost:5000/api/payment/success/:tran_id`
  - Fail URL: `http://localhost:5000/api/payment/fail/:tran_id`
  - Cancel URL: `http://localhost:5000/api/payment/cancel/:tran_id`
  - IPN URL: `http://localhost:5000/api/payment/ipn`

## 7. Suggestions for Improvement
1.  **Inventory Sync**: Implement logic in `POST /api/payment/init` to decrement `product.stock_quantity` for each item sold.
2.  **Manufacturing Integration**: Add a "Move to Inventory" button for completed manufacturing orders.
3.  **Dashboard Real-time**: Implement optimistic UI updates so stock changes reflect immediately without refresh.

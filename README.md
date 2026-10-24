# 🏥 AI Pharmacy Management System

A backend system for managing pharmacy operations, medicines, inventory, suppliers, sales, and invoices, with planned AI-powered insights and WhatsApp integration.

## 🚀 Project Overview

The **AI Pharmacy Management System** aims to simplify pharmacy operations, improve inventory management, track sales, and provide useful insights for pharmacy administrators and pharmacists.

The project is built with NestJS, TypeScript, PostgreSQL, and Prisma ORM, following a modular backend architecture.

## 🛠️ Tech Stack

- **Backend:** NestJS, Node.js, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication & Authorization:** JWT-based authentication and role-based access control
- **API Documentation:** Swagger — planned for final documentation and verification
- **Integrations:** WhatsApp Business Cloud API — planned
- **AI:** Inventory demand prediction and sales insights — planned

## 📦 Core Modules

| Module | Description | Status |
|---|---|---|
| Authentication | User authentication and access control | Implemented; testing status to be confirmed |
| Users | User management | Implemented; testing status to be confirmed |
| Roles | Role-based permissions | Implemented; testing status to be confirmed |
| Medicines | Medicine management, pricing, and stock | Implemented; testing status to be confirmed |
| Categories | Medicine category management | Implemented; testing status to be confirmed |
| Suppliers | Supplier information and management | Implemented; testing status to be confirmed |
| Inventory | Stock movements and inventory transactions | Implemented; testing status to be confirmed |
| Barcode Scanner | Medicine lookup using barcodes | Implementation/testing to be verified |
| Sales | Sales transactions, payment calculations, and stock updates | Implemented; testing status to be confirmed |
| Invoices | Invoice retrieval based on sales records | Implemented; testing status to be confirmed |
| Reports | Sales and inventory analytics | In progress |
| Dashboard | Summary statistics for administrators and pharmacists | Planned |
| WhatsApp Integration | Notifications, scheduled reports, and chatbot | Planned |
| AI Features | Stock prediction and sales analysis | Planned |

## 📊 Reports Module

The Reports module is being developed to provide insights based on actual database records.

Planned endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/reports/sales` | Sales totals and transaction count within a date range |
| GET | `/reports/top-medicines` | Best-selling medicines |
| GET | `/reports/inventory` | Inventory summary and low-stock medicines |

The sales report is designed to include total sales, total paid amounts, returned change, and the number of sales transactions.

**Status:** Implementation and endpoint testing are pending confirmation.

## 📈 Dashboard

The Dashboard will provide a consolidated overview of pharmacy performance.

Planned statistics include:

- Total sales for the current day and selected periods
- Number of sales transactions
- Inventory summary
- Low-stock and out-of-stock medicines
- Best-selling medicines
- Key sales and inventory indicators

Dashboard statistics will be calculated from existing database records rather than hardcoded values.

## 💬 WhatsApp Integration — Planned

The planned integration will use the official WhatsApp Business Platform Cloud API.

Potential features include:

- Low-stock and out-of-stock alerts
- Daily and weekly sales reports
- Supplier reorder notifications
- Invoice delivery
- Customer chatbot and human handoff
- Manager approval workflows

## 🤖 AI Features — Planned

- **Predictive Inventory Management:** Estimate which medicines may run out based on historical sales and stock levels.
- **Sales Analysis:** Identify sales trends and changes in medicine demand.
- **Reorder Suggestions:** Recommend replenishment quantities using demand estimates and inventory information.
- **AI Pharmacy Assistant:** Support approved pharmacy information workflows with appropriate safety controls.

AI predictions and reorder recommendations will require validation against actual project data before being used operationally.

## 🔐 Security

The system is designed to support:

- JWT-based authentication
- Role-based access control
- Restricted access to administrative operations
- Validation of incoming requests
- Secure handling of credentials and environment variables

## ⚙️ Getting Started

### Prerequisites

- Node.js
- npm
- PostgreSQL database
- Git

### Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd pharmacy-backend
npm install
```

Configure the required environment variables in a local `.env` file. Use the variable names expected by the project configuration, including `DATABASE_URL` where applicable.

Do not commit `.env` files, database credentials, JWT secrets, or API access tokens.

### Run the Application

```bash
npm run start:dev
```

Use the configured local port and API routes to test the application.

## 🧪 Testing

The final testing phase will cover:

- Authentication and role permissions
- Medicine and supplier operations
- Inventory transactions and stock consistency
- Sales calculations and invoice retrieval
- Report accuracy and date filters
- Dashboard statistics
- WhatsApp integration and error handling

Only features that have passed testing should be marked as fully completed.

## 🗺️ Roadmap

- [x] Core module implementation — subject to final verification
- [ ] Complete and test Reports endpoints
- [ ] Implement and test Dashboard statistics
- [ ] Complete API documentation with Swagger
- [ ] Integrate WhatsApp notifications and reporting
- [ ] Develop AI-powered inventory prediction
- [ ] Add comprehensive testing
- [ ] Docker configuration
- [ ] Deployment and production configuration

## 👩‍💻 Project Goal

Build a modular pharmacy management backend that combines reliable inventory and sales operations with automation, analytics, and AI-assisted decision support.

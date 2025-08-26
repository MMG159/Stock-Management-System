# Stock Management System - Technical Architecture Summary

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ELECTRON DESKTOP APP                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React.js + Bulma CSS)                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Login/Auth  │ │   Trading   │ │ Portfolio   │          │
│  │ Components  │ │ Interface   │ │ Management  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  IPC Bridge (preload.js)                                  │
├─────────────────────────────────────────────────────────────┤
│  Backend API Layer (Node.js)                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  User API   │ │ Trading API │ │Portfolio API│          │
│  │ (userApi.js)│ │(orders.js)  │ │(portfolio   │          │
│  │             │ │             │ │ Queries.js) │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Data Layer (SQLite3 + sql.js)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            database.sqlite                          │   │
│  │  ┌─────────┐ ┌────────────┐ ┌──────────────┐      │   │
│  │  │  USERS  │ │TRANSACTIONS│ │COMPANY_INDEXES│      │   │
│  │  └─────────┘ └────────────┘ └──────────────┘      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Database Schema

### Core Tables:

#### 1. **USERS** - User Management
```sql
CREATE TABLE USERS(
    uuid TEXT PRIMARY KEY NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    password_hash TEXT,  -- bcrypt hashed passwords
    dp_uri TEXT         -- profile picture as dataURI
);
```

#### 2. **COMPANY_INDEXES** - Stock Data
```sql
CREATE TABLE COMPANY_INDEXES(
    cuid TEXT PRIMARY KEY NOT NULL,
    sl_no INTEGER,
    name TEXT,
    symbol TEXT,
    market TEXT,        -- 'us' or 'in'
    no_equity REAL,
    price_yesterday REAL,
    price_today REAL,
    change_percentage REAL
);
```

#### 3. **TRANSACTIONS** - Trading Records
```sql
CREATE TABLE TRANSACTIONS(
    tuid TEXT PRIMARY KEY NOT NULL,
    uuid TEXT,          -- user ID
    symbol TEXT,        -- stock symbol
    order_type TEXT,    -- 'buy' or 'sell'
    date TEXT,          -- transaction date
    qty INTEGER,        -- quantity
    price REAL,         -- execution price
    FOREIGN KEY (uuid) REFERENCES USERS(uuid)
);
```

#### 4. **FUND_TRANSACTIONS** - Account Management
```sql
CREATE TABLE FUND_TRANSACTIONS(
    tuid TEXT PRIMARY KEY NOT NULL,
    uuid TEXT,
    type TEXT,          -- 'Deposit' or 'Withdraw'
    amount REAL,
    date TEXT
);
```

#### 5. **US_COMPANIES & IND_COMPANIES** - Company Master Data
```sql
CREATE TABLE US_COMPANIES(
    usuid TEXT PRIMARY KEY NOT NULL,
    name TEXT,
    symbol TEXT,
    industry TEXT,
    description TEXT,
    no_equity REAL
);
```

## 🔧 Backend API Modules

### 1. **userApi.js** - Authentication System
```javascript
Functions:
- createUser(fName, lName, email, password, dp_uri)
- login(email, password)

Features:
- bcrypt password hashing (saltRounds: 10)
- UUID-based user identification
- Email validation and duplicate checking
```

### 2. **orders.js** - Trading Engine
```javascript
Functions:
- executeOrder(uuid, symbol, qty, price, order_type)

Features:
- Buy/Sell order processing
- Transaction logging with timestamps
- Unique transaction IDs (short-uuid)
```

### 3. **queryCompanies.js** - Stock Data Management
```javascript
Functions:
- getIndCompanies() - Indian market stocks
- getUsCompanies() - US market stocks  
- getCompanyIndexes() - All stock data
- currentStockPrice(symbol) - Real-time prices

Features:
- 500+ companies (Indian + US markets)
- Price tracking and change calculation
```

### 4. **portfolioQueries.js** - Portfolio Management
```javascript
Functions:
- transactionsOnComp(uuid, symbol) - Stock-specific trades
- allTransactions(uuid) - Complete trade history

Features:
- Portfolio value calculation
- Holding quantity tracking
- Performance analytics
```

### 5. **funds.js** - Account Management
```javascript
Functions:
- fundTransaction(uuid, type, amount)
- fundTransactionHistory(uuid)

Features:
- Virtual fund deposits/withdrawals
- Account balance calculations
- Transaction history tracking
```

## 🚀 Frontend Components

### Page Structure:
```
├── index.html      - Login/Authentication
├── signup.html     - User Registration  
├── home.html       - Market Overview Dashboard
├── trade.html      - Trading Interface
├── portfolio.html  - Portfolio Management
└── funds.html      - Account Management
```

### Key React Components:
- **LoginView**: User authentication interface
- **HomeView**: Market dashboard with stock listings
- **TradePage**: Stock search, selection, and order execution
- **Portfolio**: Holdings and performance tracking

## ⚡ Market Simulation Engine

### Price Simulation Algorithm:
```javascript
const marketSimulation = async () => {
    // Connect to database
    const [companies] = await connection.execute('SELECT * FROM COMPANY_INDEXES');
    
    for (const row of companies) {
        const changePercent = changePercentFunc(0, 1);
        const price_yesterday = row.price_today;
        const changeAmount = (row.price_today * Number(changePercent)).toFixed(2);
        const price_today = Number((row.price_today + Number(changeAmount)).toFixed(2));
        
        // Update database with new prices
        await connection.execute(
            'UPDATE COMPANY_INDEXES SET price_yesterday = ?, price_today = ?, change_percentage = ? WHERE sl_no = ?',
            [price_yesterday, price_today, Number((changePercent * 100).toFixed(2)), row.sl_no]
        );
    }
};
```

### Features:
- **Automated Price Updates**: Daily price simulation
- **Realistic Market Behavior**: Random fluctuations with mathematical constraints
- **Historical Tracking**: Yesterday vs. today price comparison
- **Change Percentage Calculation**: Real-time percentage changes

## 🔒 Security Implementation

### Password Security:
```javascript
// Registration
bcrypt.hash(password, saltRounds, function (err, hash) {
    // Store hash in database
});

// Login
bcrypt.compare(password, queryResult.password_hash, function (err, result) {
    // Verify password
});
```

### SQL Injection Prevention:
```javascript
// Parameterized queries
var stmt = db.prepare('SELECT * FROM USERS WHERE email = $email;');
let queryResult = stmt.getAsObject({ $email: email });
```

### Session Management:
- UUID-based user sessions
- sessionStorage for client-side session tracking
- Secure logout functionality

## 📱 User Interface Features

### Trading Interface:
- **Stock Search**: Real-time company name/symbol search
- **Order Execution**: Buy/Sell with quantity selection
- **Balance Validation**: Fund and stock quantity checks
- **Real-time Feedback**: Success/error message system

### Portfolio Management:
- **Holdings Display**: Current stock positions
- **Value Calculation**: Real-time portfolio valuation
- **Performance Tracking**: Profit/loss calculation
- **Transaction History**: Complete trade logs

### Market Dashboard:
- **Stock Listings**: US and Indian market companies
- **Price Display**: Current prices with change indicators
- **Market Switching**: Toggle between markets
- **Visual Indicators**: Color-coded gains/losses

## 🛠️ Development Environment

### Dependencies:
```json
{
  "electron": "^22.0.0",
  "bcrypt": "^5.1.0",
  "datetime-js": "^4.0.0", 
  "short-uuid": "^4.2.2",
  "sql.js": "^1.8.0"
}
```

### Build & Deployment:
```bash
npm install    # Install dependencies
npm start      # Launch Electron app
```

### Cross-Platform Support:
- Windows, macOS, Linux compatible
- Electron packaging for distribution
- Local SQLite database (no server required)

## 📈 Performance Optimizations

1. **In-Memory Database Operations**: Load SQLite to memory for faster queries
2. **Efficient Data Structures**: Optimized React state management
3. **Minimal API Calls**: Local data processing
4. **Query Optimization**: Indexed database searches
5. **Component Optimization**: React best practices

## 🎯 Key Achievements

- **500+ Companies**: Comprehensive stock universe
- **Real-time Simulation**: Dynamic market behavior
- **Complete Trading System**: End-to-end trade execution
- **Security**: Production-ready authentication
- **Performance**: Fast, responsive desktop application
- **User Experience**: Intuitive, modern interface

---

**Technical Stack Summary:**
- **Frontend**: React.js, Bulma CSS, HTML5
- **Backend**: Node.js, Electron.js
- **Database**: SQLite3, sql.js
- **Security**: bcrypt, parameterized queries
- **Architecture**: Desktop application with local database
- **Deployment**: Cross-platform Electron packaging
# 🏭 Asset Verifier System

A comprehensive AI-powered asset verification and inventory management system built with modern technologies. This system combines computer vision, machine learning forecasting, and intelligent chatbot assistance to streamline asset management workflows.

## 🌟 Features

### 🔍 Smart Asset Verification
- **AI-Powered Image Analysis** using YOLO v8 for object detection
- **Real-time Asset Scanning** with computer vision capabilities
- **Automated Asset Classification** and verification

### 📊 Inventory Management
- **Materials & Products Tracking** with real-time updates
- **Sales Analytics** with predictive insights
- **Demand Forecasting** using machine learning algorithms
- **Automated Reorder Suggestions** based on predicted demand

### 🤖 AI Assistant
- **Claude Haiku 4.5 Integration** for intelligent conversations
- **Context-Aware Responses** about inventory and sales data
- **Natural Language Queries** for business insights
- **Streaming Chat Interface** for real-time interactions

### 📈 Analytics & Forecasting
- **Predictive Analytics** for stock management
- **Sales Trend Analysis** with visual dashboards
- **Performance Metrics** and KPI tracking
- **Interactive Charts** using Recharts

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern styling
- **Radix UI** components for accessibility
- **React Query** for data management
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** with SQLite database
- **OpenAI SDK** for AI integrations
- **WebSocket** support for real-time features

### AI & Machine Learning
- **Python** for AI services
- **OpenCV** for computer vision
- **YOLO v8** for object detection
- **scikit-learn** for machine learning
- **NumPy & Pandas** for data processing
- **Claude Haiku 4.5** for conversational AI

### DevOps & Deployment
- **Drizzle Kit** for database migrations
- **ESBuild** for fast compilation
- **Cross-platform** development support

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v20.19.0 or higher)
- **Python** (3.11 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vaibhavrxj/-vaibhav-asset-intelligence.git
cd -vaibhav-asset-intelligence
```

2. **Install Node.js dependencies**
```bash
npm install
```

3. **Install Python dependencies**
```bash
pip install -r requirements.txt
# or if you have uv installed
uv pip install -r pyproject.toml
```

4. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# AI Integrations
AI_INTEGRATIONS_OPENAI_API_KEY=your_api_key_here
AI_INTEGRATIONS_OPENAI_BASE_URL=your_base_url_here

# Database
DATABASE_URL=file:./database.sqlite

# Server
NODE_ENV=development
PORT=5000
```

5. **Initialize the database**
```bash
npm run db:push
```

6. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:5000` to see the application running!

## 📁 Project Structure

```
Asset-Verifier-System/
├── 📁 client/                  # Frontend React application
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   ├── 📁 hooks/          # Custom React hooks
│   │   ├── 📁 pages/          # Application pages
│   │   └── 📁 lib/            # Utilities and helpers
│   └── 📁 public/             # Static assets
├── 📁 server/                  # Backend Express.js server
│   ├── 📁 replit_integrations/ # AI service integrations
│   └── 📄 routes.ts           # API route definitions
├── 📁 ai_services/            # Python AI/ML services
│   ├── 📄 vision_yolo.py      # YOLO object detection
│   └── 📄 forecasting.py      # ML forecasting models
├── 📁 shared/                 # Shared types and schemas
├── 📁 migrations/             # Database migration files
└── 📄 package.json           # Node.js dependencies
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Apply database schema changes |
| `npm run check` | Type check the codebase |

## 🎯 Key Features in Detail

### Asset Verification Workflow
1. **Upload/Capture** asset images through the web interface
2. **AI Analysis** processes images using YOLO v8 for object detection
3. **Classification** automatically categorizes detected objects
4. **Verification** compares against existing inventory records
5. **Reporting** generates verification reports with confidence scores

### Inventory Predictions
- **Demand Forecasting** using historical sales data
- **Stock Level Optimization** with ML-driven recommendations
- **Seasonal Trend Analysis** for better planning
- **Automated Alerts** for low stock and reorder points

### AI Chat Assistant
- **Natural Language Processing** for inventory queries
- **Context-Aware Responses** using Claude Haiku 4.5
- **Real-time Data Access** to current inventory and sales
- **Business Intelligence** insights and recommendations

## 🔐 Security Features

- **Input Validation** using Zod schemas
- **Type Safety** throughout the application
- **Secure API Endpoints** with proper error handling
- **Environment Variable Protection** for sensitive data

## 📊 API Endpoints

### Inventory Management
- `GET /api/materials` - List all materials
- `POST /api/materials` - Create new material
- `GET /api/products` - List all products
- `POST /api/products` - Create new product

### Analytics
- `GET /api/sales` - Sales data and analytics
- `POST /api/chat` - AI chat interactions
- `POST /api/scan` - Asset verification scanning

### AI Services
- `POST /api/conversations` - Create chat conversation
- `GET /api/conversations/:id` - Get conversation history
- `POST /api/conversations/:id/messages` - Send chat message

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Configuration
For production, ensure these environment variables are set:
- `NODE_ENV=production`
- `AI_INTEGRATIONS_OPENAI_API_KEY`
- `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `DATABASE_URL`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/vaibhavrxj/-vaibhav-asset-intelligence/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🎯 Roadmap

- [ ] **Mobile Application** - React Native implementation
- [ ] **Advanced Analytics** - More ML models and insights
- [ ] **Multi-tenant Support** - Organization management
- [ ] **Integration APIs** - Third-party system connectors
- [ ] **Advanced Security** - Role-based access control
- [ ] **Cloud Deployment** - AWS/Azure deployment guides

---

**Made with ❤️ by Vaibhav**

For more information, visit our [documentation](https://github.com/vaibhavrxj/-vaibhav-asset-intelligence/wiki) or check out the [live demo](https://vaibhavrxj.github.io/-vaibhav-asset-intelligence).
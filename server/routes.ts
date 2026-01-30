import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { db } from "./db";
import { conversations, messages, visionStatusLogs, products, sales, materials, inventoryLogs, type Product, type Material, type Sale } from "@shared/schema-sqlite";
import { eq, desc, sql } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Materials
  app.get(api.materials.list.path, async (req, res) => {
    const materials = await storage.getMaterials();
    res.json(materials);
  });

  app.get(api.materials.get.path, async (req, res) => {
    const material = await storage.getMaterial(Number(req.params.id));
    if (!material) return res.status(404).json({ message: "Material not found" });
    res.json(material);
  });

  app.post(api.materials.create.path, async (req, res) => {
    try {
      const input = api.materials.create.input.parse(req.body);
      const material = await storage.createMaterial(input);
      res.status(201).json(material);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.materials.update.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getMaterial(id);
    if (!existing) return res.status(404).json({ message: "Material not found" });
    
    const input = api.materials.update.input.parse(req.body);
    const updated = await storage.updateMaterial(id, input);
    res.json(updated);
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getProduct(id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    const input = api.products.update.input.parse(req.body);
    const updated = await storage.updateProduct(id, input);
    res.json(updated);
  });

  // Vision Engine Scan Endpoint
  app.post(api.scan.process.path, async (req, res) => {
    try {
      const input = api.scan.process.input.parse(req.body);
      
      const product = await storage.getProductBySku(input.sku);
      if (!product) {
        return res.status(404).json({ message: `Product with SKU ${input.sku} not found` });
      }

      // Update product with scanned details
      const updated = await storage.updateProduct(product.id, {
        detectedColor: input.detectedColor,
        detectedTexture: input.detectedTexture,
        detectedDimensions: input.detectedDimensions,
      });
      
      // Log the scan
      await storage.logAction("SCAN", "PRODUCT", product.id, 0, "Vision Engine Scan");

      res.json({ message: "Scan processed successfully", product: updated });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Sales
  app.get(api.sales.list.path, async (req, res) => {
    const sales = await storage.getSales();
    res.json(sales);
  });

  app.post(api.sales.create.path, async (req, res) => {
    try {
      const input = api.sales.create.input.parse(req.body);
      const sale = await storage.createSale(input);
      res.status(201).json(sale);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Logs
  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  // AI Chatbot - Natural Language to SQL
  app.post('/api/chat', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get schema context
      const productsList = await db.select().from(products);
      const materialsList = await db.select().from(materials);
      const salesList = await db.select().from(sales).orderBy(desc(sales.timestamp)).limit(50);
      
      const schemaContext = `
        Database Schema:
        - products: id, name, sku, description, quantity (current stock), price, predicted_stock, predicted_demand
        - materials: id, name, sku, quantity, unit, cost_per_unit, min_stock_level
        - sales: id, product_id, quantity, total_price, timestamp
        - inventory_logs: id, timestamp, action, entity_type, entity_id, change_amount, description
        
        Current Data Summary:
        - Total Products: ${productsList.length}
        - Products: ${productsList.map((p: Product) => `${p.name} (SKU: ${p.sku}, Stock: ${p.quantity}, Price: ₹${p.price})`).join(', ')}
        - Total Materials: ${materialsList.length}
        - Materials: ${materialsList.map((m: Material) => `${m.name} (Stock: ${m.quantity} ${m.unit})`).join(', ')}
        - Recent Sales: ${salesList.length} records
      `;

      const systemPrompt = `You are an AI assistant for an Inventory Management System. You help users query inventory data using natural language.
      
${schemaContext}

When asked about:
- "Which raw materials should I buy today" - Check materials with low stock (below min_stock_level) and products with high predicted_demand
- "Low stock items" - List products/materials with quantity below thresholds
- "Sales analysis" - Analyze recent sales data
- "Predictions" - Use predicted_stock and predicted_demand fields
- "Reorder suggestions" - Products where predicted_demand > current quantity

Provide clear, concise answers with specific numbers and recommendations. Format currency in ₹ (Indian Rupees).`;

      const response = await openai.chat.completions.create({
        model: "claude-haiku-4.5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_completion_tokens: 1024,
      });

      const aiResponse = response.choices[0]?.message?.content || "I couldn't process your request.";
      
      res.json({ 
        success: true, 
        response: aiResponse,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('AI Chat error:', error);
      res.status(500).json({ error: 'Failed to process AI request' });
    }
  });

  // Forecast API (proxies to Python service or handles inline)
  app.get('/api/analytics/forecast', async (req, res) => {
    try {
      const productsList = await db.select().from(products);
      const salesData = await db.select().from(sales).orderBy(desc(sales.timestamp));
      
      const forecasts = productsList.map((product: Product) => {
        // Simple forecasting based on recent sales
        const productSales = salesData.filter((s: Sale) => s.productId === product.id);
        const totalSold = productSales.reduce((sum: number, s: Sale) => sum + s.quantity, 0);
        const avgDailySales = productSales.length > 0 ? totalSold / Math.max(7, productSales.length) : 1;
        
        const predictions = [];
        let stock = product.quantity;
        
        for (let day = 1; day <= 7; day++) {
          const predictedDemand = Math.ceil(avgDailySales);
          stock = Math.max(0, stock - predictedDemand);
          predictions.push({
            day,
            date: new Date(Date.now() + day * 86400000).toISOString().split('T')[0],
            predicted_demand: predictedDemand,
            predicted_stock: stock
          });
        }

        const totalDemand = predictions.reduce((sum, p) => sum + p.predicted_demand, 0);
        const needsReorder = predictions[6].predicted_stock < 5;

        return {
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          current_stock: product.quantity,
          predictions,
          total_predicted_demand: totalDemand,
          needs_reorder: needsReorder
        };
      });

      res.json({ success: true, data: forecasts, generated_at: new Date().toISOString() });
    } catch (error) {
      console.error('Forecast error:', error);
      res.status(500).json({ error: 'Failed to generate forecast' });
    }
  });

  // Vision Status Logs
  app.get('/api/vision/status-logs', async (req, res) => {
    try {
      const logs = await db.select().from(visionStatusLogs).orderBy(desc(visionStatusLogs.timestamp)).limit(50);
      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch vision logs' });
    }
  });

  // Vision Anomalies
  app.get('/api/vision/anomalies', async (req, res) => {
    try {
      const anomalies = await db.select().from(visionStatusLogs)
        .where(sql`${visionStatusLogs.status} IN ('DAMAGED', 'NON_STANDARD', 'UNKNOWN')`)
        .orderBy(desc(visionStatusLogs.timestamp))
        .limit(50);
      res.json({ success: true, data: anomalies });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch anomalies' });
    }
  });

  // Simulated Vision Scan
  app.post('/api/vision/scan', async (req, res) => {
    try {
      const productsList = await db.select().from(products);
      if (productsList.length === 0) {
        return res.status(404).json({ error: 'No products found' });
      }

      const randomProduct = productsList[Math.floor(Math.random() * productsList.length)];
      const confidence = Math.random() * 0.35 + 0.65; // 0.65 - 1.0
      
      const statuses = ['OK', 'OK', 'OK', 'OK', 'DAMAGED', 'NON_STANDARD'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const boundingBox = {
        x: Math.floor(Math.random() * 200) + 50,
        y: Math.floor(Math.random() * 200) + 50,
        width: Math.floor(Math.random() * 200) + 100,
        height: Math.floor(Math.random() * 200) + 100
      };

      // Log to database
      await db.insert(visionStatusLogs).values({
        productId: randomProduct.id,
        sku: randomProduct.sku,
        status,
        confidenceScore: confidence,
        detectedClass: randomProduct.sku.split('-')[1],
        boundingBox,
        notes: status !== 'OK' ? `${status} detected - manual review recommended` : null
      });

      res.json({
        success: true,
        data: {
          product_id: randomProduct.id,
          product_name: randomProduct.name,
          sku: randomProduct.sku,
          confidence,
          status,
          bounding_box: boundingBox,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Vision scan error:', error);
      res.status(500).json({ error: 'Vision scan failed' });
    }
  });

  // Reorder product (mock endpoint)
  app.post('/api/products/:id/reorder', async (req, res) => {
    try {
      const productId = Number(req.params.id);
      const { quantity } = req.body;
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const newQuantity = product.quantity + (quantity || 50);
      const updated = await storage.updateProduct(productId, { quantity: newQuantity });
      await storage.logAction("RESTOCK", "PRODUCT", productId, quantity || 50, `One-click reorder of ${quantity || 50} units`);

      res.json({ success: true, product: updated, message: `Reordered ${quantity || 50} units` });
    } catch (error) {
      res.status(500).json({ error: 'Reorder failed' });
    }
  });

  // Seed Data
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    console.log("Seeding database...");
    
    // Materials
    const wood = await storage.createMaterial({ name: "Oak Wood", sku: "MAT-OAK", quantity: 50, unit: "planks", costPerUnit: 15.50, minStockLevel: 10 });
    const steel = await storage.createMaterial({ name: "Steel Rod", sku: "MAT-STEEL", quantity: 100, unit: "rods", costPerUnit: 5.25, minStockLevel: 20 });
    const varnish = await storage.createMaterial({ name: "Wood Varnish", sku: "MAT-VARNISH", quantity: 20, unit: "liters", costPerUnit: 12.00, minStockLevel: 5 });

    // Products
    const chair = await storage.createProduct({ name: "Modern Oak Chair", sku: "PROD-001", description: "Minimalist oak chair", quantity: 12, price: 150.00 });
    const table = await storage.createProduct({ name: "Industrial Steel Table", sku: "PROD-002", description: "Sturdy steel table", quantity: 5, price: 300.00 });
    const shelf = await storage.createProduct({ name: "Wall Shelf", sku: "PROD-003", description: "Floating wall shelf", quantity: 25, price: 45.00 });

    console.log("Database seeded!");
  }

  return httpServer;
}

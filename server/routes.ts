import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

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
        lastScannedAt: new Date(), // Update timestamp
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

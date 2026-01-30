import { 
  materials, products, productRecipes, sales, inventoryLogs,
  type Material, type InsertMaterial,
  type Product, type InsertProduct,
  type Sale, type InsertSale,
  type InventoryLog,
  type ProductWithDetails
} from "@shared/schema-sqlite";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Materials
  getMaterials(): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, updates: Partial<InsertMaterial>): Promise<Material>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  
  // Sales
  createSale(sale: InsertSale): Promise<Sale>;
  getSales(): Promise<Sale[]>;

  // Logs
  getLogs(): Promise<InventoryLog[]>;
  logAction(action: string, entityType: string, entityId: number, changeAmount: number, description?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getMaterials(): Promise<Material[]> {
    return await db.select().from(materials);
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material;
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const [material] = await db.insert(materials).values(insertMaterial).returning();
    // Log creation
    await this.logAction("CREATE", "MATERIAL", material.id, material.quantity, `Created material ${material.name}`);
    return material;
  }

  async updateMaterial(id: number, updates: Partial<InsertMaterial>): Promise<Material> {
    const [updated] = await db.update(materials)
      .set(updates)
      .where(eq(materials.id, id))
      .returning();
    return updated;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.lastScannedAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    await this.logAction("CREATE", "PRODUCT", product.id, product.quantity, `Created product ${product.name}`);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    // 1. Create Sale Record
    const [sale] = await db.insert(sales).values(insertSale).returning();
    
    // 2. Decrement Product Stock
    const product = await this.getProduct(sale.productId);
    if (product) {
        await this.updateProduct(product.id, { quantity: product.quantity - sale.quantity });
        await this.logAction("SALE", "PRODUCT", product.id, -sale.quantity, `Sale #${sale.id}`);
    }

    return sale;
  }

  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.timestamp));
  }

  async getLogs(): Promise<InventoryLog[]> {
    return await db.select().from(inventoryLogs).orderBy(desc(inventoryLogs.timestamp));
  }

  async logAction(action: string, entityType: string, entityId: number, changeAmount: number, description?: string): Promise<void> {
    await db.insert(inventoryLogs).values({
      action,
      entityType,
      entityId,
      changeAmount,
      description
    });
  }
}

export const storage = new DatabaseStorage();

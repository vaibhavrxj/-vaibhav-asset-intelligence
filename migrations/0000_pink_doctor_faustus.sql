CREATE TABLE `conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer NOT NULL,
	`change_amount` real NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`sku` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`unit` text NOT NULL,
	`cost_per_unit` real NOT NULL,
	`min_stock_level` integer DEFAULT 10
);
--> statement-breakpoint
CREATE UNIQUE INDEX `materials_sku_unique` ON `materials` (`sku`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_recipes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`material_id` integer NOT NULL,
	`quantity_required` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`sku` text NOT NULL,
	`description` text,
	`quantity` integer DEFAULT 0 NOT NULL,
	`price` real NOT NULL,
	`detected_color` text,
	`detected_texture` text,
	`detected_dimensions` text,
	`last_scanned_at` text,
	`predicted_stock` integer,
	`predicted_demand` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `sales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`total_price` real NOT NULL,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `vision_status_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP,
	`product_id` integer NOT NULL,
	`sku` text NOT NULL,
	`status` text NOT NULL,
	`confidence_score` real,
	`detected_class` text,
	`bounding_box` text,
	`image_data` text,
	`notes` text
);

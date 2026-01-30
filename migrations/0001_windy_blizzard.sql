PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_conversations`("id", "title", "created_at") SELECT "id", "title", "created_at" FROM `conversations`;--> statement-breakpoint
DROP TABLE `conversations`;--> statement-breakpoint
ALTER TABLE `__new_conversations` RENAME TO `conversations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_inventory_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` text DEFAULT (datetime('now')),
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer NOT NULL,
	`change_amount` real NOT NULL,
	`description` text
);
--> statement-breakpoint
INSERT INTO `__new_inventory_logs`("id", "timestamp", "action", "entity_type", "entity_id", "change_amount", "description") SELECT "id", "timestamp", "action", "entity_type", "entity_id", "change_amount", "description" FROM `inventory_logs`;--> statement-breakpoint
DROP TABLE `inventory_logs`;--> statement-breakpoint
ALTER TABLE `__new_inventory_logs` RENAME TO `inventory_logs`;--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_messages`("id", "conversation_id", "role", "content", "created_at") SELECT "id", "conversation_id", "role", "content", "created_at" FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint
CREATE TABLE `__new_sales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`total_price` real NOT NULL,
	`timestamp` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
INSERT INTO `__new_sales`("id", "product_id", "quantity", "total_price", "timestamp") SELECT "id", "product_id", "quantity", "total_price", "timestamp" FROM `sales`;--> statement-breakpoint
DROP TABLE `sales`;--> statement-breakpoint
ALTER TABLE `__new_sales` RENAME TO `sales`;--> statement-breakpoint
CREATE TABLE `__new_vision_status_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` text DEFAULT (datetime('now')),
	`product_id` integer NOT NULL,
	`sku` text NOT NULL,
	`status` text NOT NULL,
	`confidence_score` real,
	`detected_class` text,
	`bounding_box` text,
	`image_data` text,
	`notes` text
);
--> statement-breakpoint
INSERT INTO `__new_vision_status_logs`("id", "timestamp", "product_id", "sku", "status", "confidence_score", "detected_class", "bounding_box", "image_data", "notes") SELECT "id", "timestamp", "product_id", "sku", "status", "confidence_score", "detected_class", "bounding_box", "image_data", "notes" FROM `vision_status_logs`;--> statement-breakpoint
DROP TABLE `vision_status_logs`;--> statement-breakpoint
ALTER TABLE `__new_vision_status_logs` RENAME TO `vision_status_logs`;
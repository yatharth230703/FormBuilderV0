import { pgTable, text, serial, integer, boolean, json, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  formConfigs: many(formConfig),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Form Config Table
export const formConfig = pgTable("form_config", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  label: text("label"),
  language: text("language"),
  config: json("config"),
  portal: text("portal"),
  user_id: integer("user_id").references(() => users.id),
});

export const formConfigRelations = relations(formConfig, ({ one, many }) => ({
  user: one(users, {
    fields: [formConfig.user_id],
    references: [users.id],
  }),
  responses: many(formResponses),
}));

export const insertFormConfigSchema = createInsertSchema(formConfig).pick({
  label: true,
  language: true,
  config: true,
  portal: true,
  user_id: true,
});

export type InsertFormConfig = z.infer<typeof insertFormConfigSchema>;
export type FormConfig = typeof formConfig.$inferSelect;

// Form Responses Table
export const formResponses = pgTable("form_responses", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  label: text("label"),
  language: text("language"),
  response: json("response"),
  portal: text("portal"),
  form_config_id: integer("form_config_id").references(() => formConfig.id),
});

export const formResponsesRelations = relations(formResponses, ({ one }) => ({
  formConfig: one(formConfig, {
    fields: [formResponses.form_config_id],
    references: [formConfig.id],
  }),
}));

export const insertFormResponseSchema = createInsertSchema(formResponses).pick({
  label: true,
  language: true,
  response: true,
  portal: true,
  form_config_id: true,
});

export type InsertFormResponse = z.infer<typeof insertFormResponseSchema>;
export type FormResponse = typeof formResponses.$inferSelect;

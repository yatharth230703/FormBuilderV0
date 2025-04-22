import { 
  users, type User, type InsertUser,
  formConfig, type FormConfig, type InsertFormConfig,
  formResponses, type FormResponse, type InsertFormResponse
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Form Config methods
  createFormConfig(config: InsertFormConfig): Promise<FormConfig>;
  getFormConfig(id: number): Promise<FormConfig | undefined>;
  getFormConfigs(): Promise<FormConfig[]>;
  
  // Form Response methods
  createFormResponse(response: InsertFormResponse): Promise<FormResponse>;
  getFormResponses(): Promise<FormResponse[]>;
  getFormResponsesByLabel(label: string): Promise<FormResponse[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createFormConfig(insertConfig: InsertFormConfig): Promise<FormConfig> {
    const [config] = await db.insert(formConfig).values(insertConfig).returning();
    return config;
  }

  async getFormConfig(id: number): Promise<FormConfig | undefined> {
    const [config] = await db.select().from(formConfig).where(eq(formConfig.id, id));
    return config;
  }

  async getFormConfigs(): Promise<FormConfig[]> {
    return await db.select().from(formConfig);
  }

  async createFormResponse(insertResponse: InsertFormResponse): Promise<FormResponse> {
    const [response] = await db.insert(formResponses).values(insertResponse).returning();
    return response;
  }

  async getFormResponses(): Promise<FormResponse[]> {
    return await db.select().from(formResponses);
  }

  async getFormResponsesByLabel(label: string): Promise<FormResponse[]> {
    return await db.select().from(formResponses).where(eq(formResponses.label, label));
  }
}

export const storage = new DatabaseStorage();

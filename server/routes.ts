import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { generateFormFromPrompt, editJsonWithLLM } from "./services/gemini";
import { insertFormConfigSchema, insertFormResponseSchema } from "@shared/schema";
import adminRoutes from "./admin";

import * as supabaseService from "./services/supabase";

const promptSchema = z.object({
  prompt: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Register admin routes
  app.use('/api/admin', adminRoutes);
  
  // Webhook endpoint for form generation
  app.post('/api/prompt', async (req, res) => {
    try {
      // Validate the prompt request
      const validatedData = promptSchema.parse(req.body);
      
      // Generate form configuration using Gemini
      const formConfig = await generateFormFromPrompt(validatedData.prompt);
      
      // Use a more readable label from the prompt
      const label = validatedData.prompt;
      
      try {
        // First try Supabase service
        console.log('Attempting to save form config to Supabase...');
        const id = await supabaseService.createFormConfig(
          label,
          formConfig,
          "en",
          null
        );
        
        // Return the form configuration with Supabase ID
        return res.json({
          id,
          config: formConfig,
          message: 'Form configuration generated and saved to Supabase successfully'
        });
      } catch (supabaseError) {
        console.error('Supabase storage failed, falling back to database storage:', supabaseError);
        
        // Fallback to storage interface if Supabase fails
        const storedConfig = await storage.createFormConfig({
          label,
          language: "en",
          config: formConfig,
          portal: null,
          // For now, we don't require a user for form creation
          user_id: null,
        });
        
        // Return the form configuration with database ID
        return res.json({
          id: storedConfig.id,
          config: formConfig,
          message: 'Form configuration generated successfully (fallback storage)'
        });
      }
    } catch (error) {
      console.error('Error generating form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        error: errorMessage
      });
    }
  });
  
  // Get all form configurations
  app.get('/api/forms', async (req, res) => {
    try {
      // First try Supabase
      try {
        console.log('Attempting to get form configs from Supabase...');
        const forms = await supabaseService.getAllFormConfigs();
        return res.json(forms);
      } catch (supabaseError) {
        console.error('Supabase query failed, falling back to database storage:', supabaseError);
        // Fallback to database storage
        const forms = await storage.getFormConfigs();
        return res.json(forms);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      res.status(500).json({
        error: 'Error fetching form configurations'
      });
    }
  });
  
  // Get a specific form configuration
  app.get('/api/forms/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          error: 'Invalid ID format'
        });
      }
      
      // Try Supabase first
      try {
        console.log(`Attempting to get form config with ID ${id} from Supabase...`);
        const form = await supabaseService.getFormConfig(id);
        
        if (!form) {
          return res.status(404).json({
            error: 'Form configuration not found in Supabase'
          });
        }
        
        return res.json(form);
      } catch (supabaseError) {
        console.error('Supabase query failed, falling back to database storage:', supabaseError);
        
        // Fallback to database storage
        const form = await storage.getFormConfig(id);
        
        if (!form) {
          return res.status(404).json({
            error: 'Form configuration not found in database'
          });
        }
        
        return res.json(form);
      }
    } catch (error) {
      console.error('Error fetching form:', error);
      res.status(500).json({
        error: 'Error fetching form configuration'
      });
    }
  });
  
  // Submit a form response
  app.post('/api/submit', async (req, res) => {
    try {
      // Validate and ensure form_config_id is provided if available
      const requestData = {
        ...req.body,
        // If form_config_id is not provided in the request, set it to null
        form_config_id: req.body.form_config_id || null
      };
      
      const validatedData = insertFormResponseSchema.parse(requestData);
      
      // Try Supabase first
      try {
        console.log('Attempting to save form response to Supabase...');
        
        // Extract the necessary fields from validatedData
        const label = validatedData.label || '';
        const language = validatedData.language || 'en';
        const response_data = validatedData.response || {};
        const portal = validatedData.portal || null;
        const form_config_id = validatedData.form_config_id || null;
        
        // Use Supabase service with response_data as an object
        const responseObject = typeof response_data === 'object' && response_data !== null
          ? response_data 
          : { value: response_data !== null ? response_data : 'No response' };
          
        const id = await supabaseService.createFormResponse(
          label,
          responseObject,
          language,
          portal,
          form_config_id
        );
        
        return res.json({
          id,
          message: 'Form response submitted to Supabase successfully'
        });
      } catch (supabaseError) {
        console.error('Supabase storage failed, falling back to database storage:', supabaseError);
        
        // Fallback to database storage
        const response = await storage.createFormResponse(validatedData);
        
        return res.json({
          id: response.id,
          message: 'Form response submitted successfully (fallback storage)'
        });
      }
    } catch (error) {
      console.error('Error submitting form response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        error: errorMessage
      });
    }
  });
  app.post("/api/edit-json", async (req, res) => {
    try {
      const { json, instruction } = req.body as {
        json: object;
        instruction: string;
      };
  
      // send original + instruction off to your LLM helper
      const updatedText = await editJsonWithLLM(json, instruction);
      const updated = JSON.parse(updatedText);
  
      return res.json({ config: updated });
    } catch (error) {
      console.error("Error editing JSON:", error);
      return res.status(500).json({ error: "Failed to edit JSON" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

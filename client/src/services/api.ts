import { apiRequest } from "@/lib/queryClient";
import { FormConfig, PromptRequest, FormResponse } from "@shared/types";

/**
 * Form Engine API service
 * Handles communication with the backend API
 */

/**
 * Generate a form from a natural language prompt
 * @param prompt The user's natural language prompt
 * @returns Generated form configuration
 */
export async function generateFormFromPrompt(prompt: string): Promise<{ id: number; config: FormConfig }> {
  const response = await apiRequest("POST", "/api/prompt", { prompt });
  return response.json();
}

/**
 * Submit form responses to the backend
 * @param label Form label/identifier
 * @param formResponses The user's responses to the form
 * @returns Submission confirmation
 */
export async function submitFormResponses(label: string, formResponses: Record<string, any>): Promise<{ id: number; message: string }> {
  const response = await apiRequest("POST", "/api/submit", {
    label,
    language: "en",
    response: formResponses,
    portal: null
  });
  return response.json();
}

/**
 * Get all form configurations
 * @returns List of form configurations
 */
export async function getFormConfigs(): Promise<FormConfig[]> {
  const response = await apiRequest("GET", "/api/forms");
  return response.json();
}

/**
 * Get a specific form configuration by ID
 * @param id Form configuration ID
 * @returns The requested form configuration
 */
export async function getFormConfig(id: number): Promise<FormConfig> {
  const response = await apiRequest("GET", `/api/forms/${id}`);
  return response.json();
}

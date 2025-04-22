/**
 * This module handles interactions with the Supabase API
 * for database operations
 */

import { createClient } from '@supabase/supabase-js';
import { FormConfig, FormResponse } from '@shared/types';

import dotenv from 'dotenv';
dotenv.config();


// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates a new form configuration in Supabase
 * @param label The form label (prompt)
 * @param config The form configuration object
 * @param language The form language
 * @param portal Optional portal identifier
 * @returns The ID of the newly created form configuration
 */
export async function createFormConfig(
  label: string,
  config: FormConfig,
  language = 'en',
  portal: string | null = null
): Promise<number> {
  const { data, error } = await supabase
    .from('form_config')
    .insert([
      { 
        label, 
        config,
        language,
        portal
      }
    ])
    .select('id')
    .single();
  
  if (error) {
    console.error('Supabase error creating form config:', error);
    throw new Error(`Failed to create form config in Supabase: ${error.message}`);
  }
  
  return data.id;
}

/**
 * Gets a form configuration by ID from Supabase
 * @param id The form configuration ID
 * @returns The form configuration
 */
export async function getFormConfig(id: number): Promise<{ id: number; label: string; config: FormConfig; created_at: string }> {
  const { data, error } = await supabase
    .from('form_config')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Supabase error getting form config with ID ${id}:`, error);
    throw new Error(`Failed to get form config from Supabase: ${error.message}`);
  }
  
  // Ensure created_at exists
  if (!data.created_at) {
    data.created_at = new Date().toISOString();
  }
  
  return data;
}

/**
 * Gets all form configurations from Supabase
 * @returns Array of form configurations
 */
export async function getAllFormConfigs(): Promise<{ id: number; label: string; config: FormConfig; created_at: string }[]> {
  const { data, error } = await supabase
    .from('form_config')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Supabase error getting all form configs:', error);
    throw new Error(`Failed to get form configs from Supabase: ${error.message}`);
  }
  
  // Ensure all items have created_at
  const formattedData = (data || []).map(item => {
    if (!item.created_at) {
      item.created_at = new Date().toISOString();
    }
    return item;
  });
  
  return formattedData;
}

/**
 * Creates a new form response in Supabase
 * @param label The form label
 * @param responseData The form response data
 * @param language The form language
 * @param portal Optional portal identifier
 * @param formConfigId Optional form configuration ID
 * @returns The ID of the newly created form response
 */
export async function createFormResponse(
  label: string,
  responseData: Record<string, any>,
  language = 'en',
  portal: string | null = null,
  formConfigId: number | null = null
): Promise<number> {
  const { data, error } = await supabase
    .from('form_responses')
    .insert([
      { 
        label, 
        response_data: responseData,
        language,
        portal,
        form_config_id: formConfigId
      }
    ])
    .select('id')
    .single();
  
  if (error) {
    console.error('Supabase error creating form response:', error);
    throw new Error(`Failed to create form response in Supabase: ${error.message}`);
  }
  
  return data.id;
}

/**
 * Gets all form responses from Supabase
 * @returns Array of form responses
 */
export async function getAllFormResponses(): Promise<any[]> {
  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Supabase error getting all form responses:', error);
    throw new Error(`Failed to get form responses from Supabase: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Gets form responses by label from Supabase
 * @param label The form label
 * @returns Array of form responses
 */
export async function getFormResponsesByLabel(label: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('form_responses')
    .select('*')
    .eq('label', label)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(`Supabase error getting form responses for label ${label}:`, error);
    throw new Error(`Failed to get form responses from Supabase: ${error.message}`);
  }
  
  return data || [];
}
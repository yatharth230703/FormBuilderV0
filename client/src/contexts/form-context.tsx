import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FormConfig, FormStep } from "@shared/types";

interface FormContextType {
  formConfig: FormConfig | null;
  setFormConfig: (config: FormConfig) => void;
  formResponses: Record<string, any>;
  updateResponse: (key: string, value: any) => void;
  resetForm: () => void;
  resetResponses: () => void;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  isFormComplete: boolean;
  setIsFormComplete: (isComplete: boolean) => void;
  validateCurrentStep: () => boolean;
  isStepValid: (stepIndex: number) => boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false);

  // Reset step when form config changes
  useEffect(() => {
    if (formConfig) {
      setCurrentStep(1);
      setFormResponses({});
      setIsFormComplete(false);
    }
  }, [formConfig]);

  // Calculate total steps
  const totalSteps = formConfig?.steps.length || 1;

  // Update a response value
  const updateResponse = (key: string, value: any) => {
    setFormResponses(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Move to the next step
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Move to the previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Reset the form (including config and responses)
  const resetForm = () => {
    setFormConfig(null);
    setFormResponses({});
    setCurrentStep(1);
    setIsFormComplete(false);
  };

  // Reset just the responses (keep the config)
  const resetResponses = () => {
    setFormResponses({});
    setCurrentStep(1);
    setIsFormComplete(false);
  };
  
  // Validate if a specific step has valid responses
  const isStepValid = (stepIndex: number): boolean => {
    if (!formConfig || !formConfig.steps || stepIndex < 0 || stepIndex >= formConfig.steps.length) {
      return false;
    }

    const step = formConfig.steps[stepIndex];
    const stepResponse = formResponses[step.title];
    
    switch (step.type) {
      case 'tiles':
        // Required by default, should have a selection
        return !!stepResponse;
      
      case 'multiSelect':
        // At least one selection required
        return Array.isArray(stepResponse) && stepResponse.length > 0;
      
      case 'slider':
        // Slider always has a value (defaultValue)
        return true;
      
      case 'followup':
        // Should have both a selection and followup answer
        return !!stepResponse && 
          typeof stepResponse === 'object' && 
          'option' in stepResponse && 
          'value' in stepResponse;
      
      case 'textbox':
        // Check if required and if it meets minLength
        if (step.validation?.required) {
          return !!stepResponse && 
            typeof stepResponse === 'string' && 
            (!step.validation.minLength || stepResponse.length >= step.validation.minLength);
        }
        return true;
      
      case 'location':
        // Check if required and has a valid location response
        if (step.validation?.required) {
          return !!stepResponse && 
            typeof stepResponse === 'object' && 
            'postalCode' in stepResponse;
        }
        return true;
      
      case 'contact':
        // Contact is usually required and needs valid email
        if (!stepResponse || typeof stepResponse !== 'object') return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const { firstName, email } = stepResponse as any;
        
        return !!firstName && !!email && emailRegex.test(email);
      
      default:
        return true;
    }
  };
  
  // Validate the current step
  const validateCurrentStep = (): boolean => {
    return isStepValid(currentStep - 1);
  };

  return (
    <FormContext.Provider
      value={{
        formConfig,
        setFormConfig,
        formResponses,
        updateResponse,
        resetForm,
        resetResponses,
        currentStep,
        totalSteps,
        nextStep,
        prevStep,
        isSubmitting,
        setIsSubmitting,
        isFormComplete,
        setIsFormComplete,
        validateCurrentStep,
        isStepValid
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}

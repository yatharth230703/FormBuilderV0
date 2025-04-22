import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { LocationStep as LocationStepType } from "@shared/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationStepProps {
  step: LocationStepType;
}

export default function LocationStep({ step }: LocationStepProps) {
  const { updateResponse, formResponses, formConfig } = useFormContext();
  const [locationInput, setLocationInput] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<'success' | 'error' | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Get the current response for this step if it exists
  useEffect(() => {
    const savedResponse = formResponses[step.title];
    if (savedResponse && typeof savedResponse === 'object') {
      if ('postalCode' in savedResponse) {
        setLocationInput(savedResponse.postalCode);
        setValidationStatus('success');
        if (savedResponse.isAvailable) {
          setValidationMessage(
            formConfig?.ui?.location?.availableIn?.replace('{city}', savedResponse.postalCode) || 
            `Our service is available in ${savedResponse.postalCode}!`
          );
        } else {
          setValidationMessage(
            formConfig?.ui?.location?.notAvailable || 
            'Sorry, we don\'t serve this area yet'
          );
        }
      }
    }
  }, [formResponses, step.title, formConfig]);

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationInput(e.target.value);
    setValidationStatus(null);
    setValidationMessage(null);
  };

  const validateLocation = () => {
    if (!locationInput.trim()) {
      setValidationStatus('error');
      setValidationMessage(formConfig?.ui?.messages?.thisFieldRequired || 'This field is required');
      return;
    }

    setIsValidating(true);
    
    // Simulate location validation - in a real app, this would call an API
    setTimeout(() => {
      // For demo purposes, consider any input with numbers valid
      const isValid = /\d/.test(locationInput);
      
      if (isValid) {
        setValidationStatus('success');
        setValidationMessage(
          formConfig?.ui?.location?.availableIn?.replace('{city}', locationInput) || 
          `Our service is available in ${locationInput}!`
        );
        updateResponse(step.title, {
          postalCode: locationInput,
          isAvailable: true
        });
      } else {
        setValidationStatus('error');
        setValidationMessage(
          formConfig?.ui?.location?.notAvailable || 
          'Sorry, we don\'t serve this area yet'
        );
        updateResponse(step.title, {
          postalCode: locationInput,
          isAvailable: false
        });
      }
      
      setIsValidating(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col py-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-2xl font-bold mb-2 text-center">{step.title}</h3>
        <p className="text-gray-500 mb-5 text-center">{step.subtitle}</p>
      </motion.div>
      
      <motion.div 
        className="w-full mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="relative">
          <Input 
            type="text" 
            value={locationInput}
            onChange={handleLocationInputChange}
            className="w-full p-4 pr-12 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder={step.config.labels?.searchPlaceholder || "Enter your postal code"}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                validateLocation();
              }
            }}
          />
          <Button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary p-1"
            variant="ghost"
            size="sm"
            onClick={validateLocation}
            disabled={isValidating}
          >
            {isValidating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <AnimatePresence mode="wait">
          {validationStatus && (
            <motion.div 
              key={validationStatus}
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mt-3 p-3 rounded-lg flex items-start ${
                validationStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {validationStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              )}
              <span className="text-sm">{validationMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Location visual */}
      <AnimatePresence>
        {validationStatus === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mt-6 flex items-center justify-center"
          >
            <div className="flex items-center bg-primary/10 p-6 rounded-xl shadow-sm w-full max-w-md">
            <div className="bg-primary text-white p-4 rounded-full mr-6 flex items-center justify-center">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-primary mb-1">Location Confirmed</h4>
              <p className="text-sm text-gray-600">{locationInput}</p>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tips */}
      {!validationStatus && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>Enter a postal code or ZIP code to check if our service is available in your area.</p>
          <p className="mt-1 text-xs">Hint: Try any number to see a successful validation.</p>
        </motion.div>
      )}
    </div>
  );
}

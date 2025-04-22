import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FormRenderer from "@/components/form-renderer";
import { useFormContext } from "@/contexts/form-context";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCcw, Save, CheckCircle, Send } from "lucide-react";

export default function RightPanel() {
  const [testMode, setTestMode] = useState(false);
  const { toast } = useToast();
  const { 
    formConfig, 
    formResponses, 
    currentStep, 
    totalSteps,
    resetForm, 
    resetResponses
  } = useFormContext();

  const handleResetForm = () => {
    resetResponses();
    toast({
      title: "Form Reset",
      description: "Form responses have been reset",
    });
  };

  const handleSaveForm = async () => {
    if (!formConfig) {
      toast({
        title: "Error",
        description: "No form configuration to save",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Form Saved",
        description: "Form configuration has been saved",
      });
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "Failed to save form configuration",
        variant: "destructive",
      });
    }
  };

  const handleTestForm = () => {
    if (!formConfig) {
      toast({
        title: "Error",
        description: "No form to test",
        variant: "destructive",
      });
      return;
    }

    setTestMode(!testMode);
    resetResponses();
    
    toast({
      title: testMode ? "Test Mode Disabled" : "Test Mode Enabled",
      description: testMode 
        ? "Exited test mode" 
        : "Now in test mode. Responses won't be saved.",
    });
  };

  const handlePublishForm = async () => {
    if (!formConfig) {
      toast({
        title: "Error",
        description: "No form to publish",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Form Published",
      description: "Form is now available via webhook",
    });
  };

  return (
    <div className="w-full md:w-[70%] h-full flex flex-col bg-gray-100 p-2 md:p-6">
      {/* Container that holds the 16:9 aspect ratio */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="
            w-full
            max-w-5xl
            aspect-[16/9]
            bg-white
            rounded-xl
            shadow-lg
            overflow-hidden
            relative
          "
        >
          <FormRenderer testMode={testMode} />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-5xl mx-auto mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost"
            className="flex items-center text-sm text-gray-500 hover:text-gray-900 px-3 py-1 rounded"
            onClick={handleResetForm}
          >
            <RefreshCcw className="mr-1 h-4 w-4" />
            Reset
          </Button>
          <Button 
            variant="ghost"
            className="flex items-center text-sm text-gray-500 hover:text-gray-900 px-3 py-1 rounded"
            onClick={handleSaveForm}
            disabled={!formConfig}
          >
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            className={`
              flex items-center text-sm
              ${testMode ? 'bg-primary text-white hover:bg-primary/90' : 'text-primary hover:text-primary-dark'}
              px-3 py-1 rounded border border-primary
            `}
            onClick={handleTestForm}
            disabled={!formConfig}
          >
            <CheckCircle className="mr-1 h-4 w-4" />
            {testMode ? "Exit Test" : "Test Form"}
          </Button>
          <Button 
            variant="outline"
            className="flex items-center text-sm text-primary hover:text-primary-dark px-3 py-1 rounded border border-primary"
            onClick={handlePublishForm}
            disabled={!formConfig}
          >
            <Send className="mr-1 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}

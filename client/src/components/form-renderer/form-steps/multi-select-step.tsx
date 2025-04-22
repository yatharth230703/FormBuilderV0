import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { MultiSelectStep as MultiSelectStepType } from "@shared/types";
import * as LucideIcons from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiSelectStepProps {
  step: MultiSelectStepType;
}

export default function MultiSelectStep({ step }: MultiSelectStepProps) {
  const { updateResponse, formResponses, currentStep } = useFormContext();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Get the current response for this step if it exists
  useEffect(() => {
    const savedResponse = formResponses[step.title];
    if (savedResponse && Array.isArray(savedResponse)) {
      setSelectedOptions(savedResponse);
    } else {
      // Reset selection if no saved response exists
      setSelectedOptions([]);
    }
  }, [formResponses, step.title, currentStep]);

  const handleToggleOption = (optionId: string) => {
    let newSelectedOptions: string[];
    
    if (selectedOptions.includes(optionId)) {
      newSelectedOptions = selectedOptions.filter(id => id !== optionId);
    } else {
      newSelectedOptions = [...selectedOptions, optionId];
    }
    
    setSelectedOptions(newSelectedOptions);
    updateResponse(step.title, newSelectedOptions);
  };

  // Dynamically render the Lucide icon
  const renderIcon = (iconName: string) => {
    // Default icons based on common categories if the icon is not found
    const defaultIcons: Record<string, keyof typeof LucideIcons> = {
      "web": "Globe",
      "website": "Globe",
      "mobile": "Smartphone",
      "app": "Smartphone", 
      "design": "Palette",
      "marketing": "TrendingUp",
      "development": "Code",
      "support": "LifeBuoy",
      "social": "Share2",
      "email": "Mail",
      "phone": "Phone",
      "location": "MapPin",
      "business": "Briefcase",
      "finance": "DollarSign",
      "education": "GraduationCap",
      "health": "Activity",
      "food": "Utensils",
      "travel": "Plane",
      "home": "Home",
      "security": "Shield",
      "cloud": "Cloud",
      "analytics": "BarChart",
      "ecommerce": "ShoppingCart",
      "blog": "FileText",
      "user": "User"
    };
    
    // Try exact match first
    let Icon = (LucideIcons as any)[iconName];
    
    // If no exact match, try to find a semantic match
    if (!Icon && iconName) {
      try {
        const lowerIconName = iconName.toLowerCase();
        // Find a key in defaultIcons that is contained in the iconName
        const matchedKey = Object.keys(defaultIcons).find(key => 
          lowerIconName.includes(key.toLowerCase())
        );
        
        if (matchedKey) {
          Icon = (LucideIcons as any)[defaultIcons[matchedKey]];
        }
      } catch (error) {
        console.warn("Error processing icon name:", iconName);
      }
    }
    
    // Final fallback
    if (!Icon) {
      Icon = LucideIcons.CheckCircle;
    }
    
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="flex-1 flex flex-col py-2">
      <h3 className="text-2xl font-bold mb-1 text-center">{step.title}</h3>
      <p className="text-gray-500 mb-1 text-center">{step.subtitle}</p>
      <p className="text-sm text-gray-400 mb-5">Select all that apply</p>
      
      <div className="grid grid-cols-2 gap-4 mb-0">
        {step.options.map((option) => (
          <div 
            key={option.id}
            className={`border ${selectedOptions.includes(option.id) ? 'border-primary bg-primary/5' : 'border-gray-200'} rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-gray-50 transition-all`}
            onClick={() => handleToggleOption(option.id)}
          >
            <div className="flex items-start">
              <div className="flex items-center justify-center bg-primary bg-opacity-10 rounded-full p-2 mr-3 text-primary">
                {renderIcon(option.icon)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-lg">{option.title}</h4>
                  <Checkbox 
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={() => handleToggleOption(option.id)}
                    className="h-5 w-5 border-gray-300"
                  />
                </div>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

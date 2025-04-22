import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "@/contexts/form-context";
import { apiRequest } from "@/lib/queryClient";
import { Thermometer, Copy, Download, ArrowUp, Palette } from "lucide-react";
import { FormConfig } from "@shared/types";
import { useLocation } from "wouter";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LeftPanel() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState("Ready");
  const [statusColor, setStatusColor] = useState("bg-green-500");
  
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { setFormConfig, formConfig, resetForm } = useFormContext();

  const applyTheme = (themeName) => {
    // Remove any existing theme classes
    document.documentElement.classList.remove(
      'theme-modern', 
      'theme-classic', 
      'theme-elegant', 
      'theme-minimalist', 
      'theme-vibrant',
      'dark'
    );
    
    // Add the new theme class
    document.documentElement.classList.add(`theme-${themeName}`);
    
    // Save theme preference
    localStorage.setItem('theme-preset', themeName);
    
    // Apply the fonts
    const fontMap = {
      'modern': "'Poppins', sans-serif",
      'classic': "'Merriweather', serif",
      'elegant': "'Playfair Display', serif",
      'minimalist': "'Inter', sans-serif",
      'vibrant': "'Montserrat', sans-serif"
    };
    
    document.documentElement.style.setProperty('--font-primary', fontMap[themeName]);
    
    toast({
      title: "Theme Changed",
      description: `Applied ${themeName} theme and font`,
    });
  };

  useEffect(() => {
    // Load saved theme preference or default to 'modern'
    const savedTheme = localStorage.getItem('theme-preset') || 'modern';
    applyTheme(savedTheme);
    
    // Add the fonts to the document head
    const fontLinks = [
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
    ];
    
    fontLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  useEffect(() => {
    // Add CSS variables for theme colors
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      :root {
        --font-primary: 'Poppins', sans-serif;
      }
      .theme-modern {
        --color-primary: #3b82f6;
        --color-primary-dark: #2563eb;
        --color-secondary: #a855f7;
        --color-background: #ffffff;
        --color-foreground: #1e293b;
        --color-accent: #2dd4bf;
      }
      .theme-classic {
        --color-primary: #15803d;
        --color-primary-dark: #166534;
        --color-secondary: #854d0e;
        --color-background: #f8fafc;
        --color-foreground: #1e293b;
        --color-accent: #ca8a04;
      }
      .theme-elegant {
        --color-primary: #7e22ce;
        --color-primary-dark: #6b21a8;
        --color-secondary: #6d28d9;
        --color-background: #f8f9fa;
        --color-foreground: #1e293b;
        --color-accent: #d946ef;
      }
      .theme-minimalist {
        --color-primary: #334155;
        --color-primary-dark: #1e293b;
        --color-secondary: #475569;
        --color-background: #ffffff;
        --color-foreground: #020617;
        --color-accent: #94a3b8;
      }
      .theme-vibrant {
        --color-primary: #db2777;
        --color-primary-dark: #be185d;
        --color-secondary: #f43f5e;
        --color-background: #ffffff;
        --color-foreground: #1e1b4b;
        --color-accent: #f97316;
      }
      
      body, button, input, select, textarea {
        font-family: var(--font-primary);
      }
      
      .text-primary {
        color: var(--color-primary);
      }
      
      .bg-primary {
        background-color: var(--color-primary);
      }
      
      .hover\\:bg-primary-dark:hover {
        background-color: var(--color-primary-dark);
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleGenerateForm = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setStatusText("Generating form...");
    setStatusColor("bg-yellow-500");

    try {
      const data = await apiRequest<{id: number; config: FormConfig}>({
        url: "/api/prompt",
        method: "POST",
        body: JSON.stringify({ prompt }),
        headers: {
          "Content-Type": "application/json" 
        }
      });
      
      if (data.config) {
        setFormConfig(data.config);
        setStatusText("Form generated successfully");
        setStatusColor("bg-green-500");
        toast({
          title: "Success",
          description: "Form configuration generated successfully",
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error generating form:", error);
      setStatusText("Form generation failed");
      setStatusColor("bg-red-500");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate form",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopyJson = () => {
    if (!formConfig) return;
    
    navigator.clipboard.writeText(JSON.stringify(formConfig, null, 2))
      .then(() => {
        toast({
          title: "JSON copied",
          description: "Form configuration copied to clipboard",
        });
      })
      .catch((error) => {
        console.error("Error copying to clipboard:", error);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      });
  };
  
  const handleDownloadJson = () => {
    if (!formConfig) return;
    
    const jsonString = JSON.stringify(formConfig, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "form-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "JSON downloaded",
      description: "Form configuration downloaded as JSON file",
    });
  };

  return (
    <div className="w-full md:w-[30%] h-full flex flex-col border-r border-gray-200 bg-white relative p-4 overflow-hidden">
      {/* Header */}
      <div className="py-4 mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <Thermometer className="h-7 w-7 mr-2" />
          Forms Engine
        </h1>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => {
              setLocation("/admin/login");
            }}
          >
            Admin Portal
          </Button>
          
          {/* Theme Dropdown - Replaces the original theme toggle button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                title="Change theme"
                className="relative"
              >
                <Palette className="h-5 w-5" />
                <span className="sr-only">Change theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Theme & Font</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => applyTheme('modern')}>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 rounded-full w-4 h-4"></div>
                  <span>Modern Blue - Poppins</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTheme('classic')}>
                <div className="flex items-center gap-2">
                  <div className="bg-green-700 rounded-full w-4 h-4"></div>
                  <span>Classic Green - Merriweather</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTheme('elegant')}>
                <div className="flex items-center gap-2">
                  <div className="bg-purple-700 rounded-full w-4 h-4"></div>
                  <span>Elegant Purple - Playfair</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTheme('minimalist')}>
                <div className="flex items-center gap-2">
                  <div className="bg-gray-800 rounded-full w-4 h-4"></div>
                  <span>Minimalist - Inter</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyTheme('vibrant')}>
                <div className="flex items-center gap-2">
                  <div className="bg-pink-600 rounded-full w-4 h-4"></div>
                  <span>Vibrant - Montserrat</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Prompt Input Section */}
      <div className="mb-4">
        <label htmlFor="prompt" className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Enter Form Prompt
        </label>
        <Textarea 
          id="prompt" 
          className="w-full h-32 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
          placeholder="E.g., Create an onboarding survey that asks for name, role, preferred tools, and expected project count."
          value={prompt}
          onChange={handlePromptChange}
        />
      </div>
      
      {/* Generate Form Button */}
      <Button 
        className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-dark transition-colors mb-4 flex items-center justify-center shadow-sm"
        onClick={handleGenerateForm}
        disabled={isGenerating || !prompt.trim()}
      >
        <ArrowUp className="mr-2 h-5 w-5" />
        {isGenerating ? "Generating..." : "Generate Form"}
      </Button>
      
      {/* JSON Output Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Generated JSON
          </label>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs p-1 text-primary hover:text-primary-dark" 
              title="Copy JSON"
              onClick={handleCopyJson}
              disabled={!formConfig}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs p-1 text-primary hover:text-primary-dark" 
              title="Download JSON"
              onClick={handleDownloadJson}
              disabled={!formConfig}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 border rounded-lg p-3 bg-gray-50 overflow-y-auto custom-scrollbar text-sm font-mono relative">
          {formConfig ? (
            <pre className="whitespace-pre-wrap overflow-auto">{JSON.stringify(formConfig, null, 2)}</pre>
          ) : (
            <div className="text-center text-gray-500 p-8">
              Generated JSON will appear here after form creation
            </div>
          )}
          
          {/* Loading Spinner (Initially Hidden) */}
          {isGenerating && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="py-2 mt-2 text-xs text-gray-500 flex items-center">
        <span className={`w-2 h-2 rounded-full ${statusColor} mr-2`}></span>
        <span>{statusText}</span>
      </div>
    </div>
  );
}
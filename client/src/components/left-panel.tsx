import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "@/contexts/form-context";
import { apiRequest } from "@/lib/queryClient";
import { Thermometer, Copy, Download, ArrowUp, Palette, Send } from "lucide-react";
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

// Message type for chat history
type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
  jsonData?: FormConfig | null;
};

export default function LeftPanel() {
  const [prompt, setPrompt] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "system",
      content: "Welcome to Forms Engine! Enter a prompt to generate a form.",
      timestamp: new Date(),
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState("Ready");
  const [statusColor, setStatusColor] = useState("bg-green-500");
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { setFormConfig, formConfig, resetForm } = useFormContext();

  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Theme management functions
  const applyTheme = (themeName: string) => {
    document.documentElement.classList.remove(
      "theme-modern",
      "theme-classic",
      "theme-elegant",
      "theme-minimalist",
      "theme-vibrant",
      "dark"
    );
    document.documentElement.classList.add(`theme-${themeName}`);
    localStorage.setItem("theme-preset", themeName);
    const fontMap: Record<string, string> = {
      modern: "'Poppins', sans-serif",
      classic: "'Merriweather', serif",
      elegant: "'Playfair Display', serif",
      minimalist: "'Inter', sans-serif",
      vibrant: "'Montserrat', sans-serif",
    };
    document.documentElement.style.setProperty(
      "--font-primary",
      fontMap[themeName]
    );
    toast({
      title: "Theme Changed",
      description: `Applied ${themeName} theme and font`,
    });
  };

  // Load fonts and initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme-preset") || "modern";
    applyTheme(savedTheme);

    const fontLinks = [
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
    ];
    fontLinks.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  // Add CSS variables for theming
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      :root { --font-primary: 'Poppins', sans-serif; }
      .theme-modern {
        --color-primary: #3b82f6; --color-primary-dark: #2563eb;
        --color-secondary: #a855f7; --color-background: #ffffff;
        --color-foreground: #1e293b; --color-accent: #2dd4bf;
      }
      .theme-classic {
        --color-primary: #15803d; --color-primary-dark: #166534;
        --color-secondary: #854d0e; --color-background: #f8fafc;
        --color-foreground: #1e293b; --color-accent: #ca8a04;
      }
      .theme-elegant {
        --color-primary: #7e22ce; --color-primary-dark: #6b21a8;
        --color-secondary: #6d28d9; --color-background: #f8f9fa;
        --color-foreground: #1e293b; --color-accent: #d946ef;
      }
      .theme-minimalist {
        --color-primary: #334155; --color-primary-dark: #1e293b;
        --color-secondary: #475569; --color-background: #ffffff;
        --color-foreground: #020617; --color-accent: #94a3b8;
      }
      .theme-vibrant {
        --color-primary: #db2777; --color-primary-dark: #be185d;
        --color-secondary: #f43f5e; --color-background: #ffffff;
        --color-foreground: #1e1b4b; --color-accent: #f97316;
      }
      body, button, input, select, textarea { font-family: var(--font-primary); }
      .text-primary { color: var(--color-primary); }
      .bg-primary { background-color: var(--color-primary); }
      .hover\\:bg-primary-dark:hover { background-color: var(--color-primary-dark); }
    `;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  // Handle sending a message in chat
  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: userText,
      timestamp: new Date(),
    };
    setChatHistory((prev) => [...prev, userMessage]);
    
    // Clear input
    setPrompt("");
    
    // Start loading state
    setIsGenerating(true);
    
    // Add temporary assistant message with loading state
    const tempAssistantMsg: ChatMessage = {
      role: "assistant",
      content: "Generating...",
      timestamp: new Date(),
      isGenerating: true,
    };
    setChatHistory((prev) => [...prev, tempAssistantMsg]);
    
    // Determine if this is initial form generation or JSON editing
    const isInitialGeneration = !formConfig;
    
    try {
      if (isInitialGeneration) {
        // Generate initial form
        await handleInitialFormGeneration(userText);
      } else {
        // Edit existing JSON
        await handleJsonEdit(userText);
      }
    } catch (error) {
      // Handle errors
      console.error("Error:", error);
      // Remove loading message
      setChatHistory((prev) => prev.filter(msg => !msg.isGenerating));
      // Add error message
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Something went wrong"}`,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMsg]);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle initial form generation
  const handleInitialFormGeneration = async (promptText: string) => {
    setStatusText("Generating form...");
    setStatusColor("bg-yellow-500");

    const data = await apiRequest<{ id: number; config: FormConfig }>({
      url: "/api/prompt",
      method: "POST",
      body: JSON.stringify({ prompt: promptText }),
      headers: { "Content-Type": "application/json" },
    });

    if (!data.config) {
      throw new Error("Invalid response from server");
    }

    // Update form config
    setFormConfig(data.config);
    setStatusText("Form generated successfully");
    setStatusColor("bg-green-500");

    // Remove loading message
    setChatHistory((prev) => prev.filter(msg => !msg.isGenerating));
    
    // Add success message with JSON
    const successMsg: ChatMessage = {
      role: "assistant",
      content: "✅ Form generated successfully! Here's the JSON. You can now ask me to modify specific parts of the form.",
      timestamp: new Date(),
      jsonData: data.config,
    };
    setChatHistory((prev) => [...prev, successMsg]);

    toast({
      title: "Success",
      description: "Form configuration generated successfully",
    });
  };

  // Handle JSON editing
  const handleJsonEdit = async (instruction: string) => {
    if (!formConfig) {
      throw new Error("No form configuration to edit");
    }

    // Call the API to edit the JSON
    const res = await apiRequest<{ config: FormConfig }>({
      url: "/api/edit-json",
      method: "POST",
      body: JSON.stringify({
        json: formConfig,
        instruction: instruction,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.config) {
      throw new Error("Invalid response from server");
    }

    // Update form config
    setFormConfig(res.config);

    // Remove loading message
    setChatHistory((prev) => prev.filter(msg => !msg.isGenerating));
    
    // Add success message with updated JSON
    const successMsg: ChatMessage = {
      role: "assistant",
      content: "✅ Form updated successfully! Here's the updated JSON. You can continue making changes or test the form.",
      timestamp: new Date(),
      jsonData: res.config,
    };
    setChatHistory((prev) => [...prev, successMsg]);

    toast({
      title: "Success",
      description: "Form configuration updated successfully",
    });
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(prompt);
    }
  };

  // Handle copy JSON
  const handleCopyJson = () => {
    if (!formConfig) return;
    navigator.clipboard
      .writeText(JSON.stringify(formConfig, null, 2))
      .then(() =>
        toast({
          title: "JSON copied",
          description: "Form configuration copied to clipboard",
        })
      )
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        })
      );
  };

  // Handle download JSON
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
    <div className="w-full md:w-[30%] h-full flex flex-col border-r border-gray-200 bg-white p-4 overflow-hidden">
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
            onClick={() => setLocation("/admin/login")}
          >
            Admin Portal
          </Button>
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
              {["modern", "classic", "elegant", "minimalist", "vibrant"].map((t) => (
                <DropdownMenuItem key={t} onClick={() => applyTheme(t)}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        t === "modern"
                          ? "bg-blue-600"
                          : t === "classic"
                          ? "bg-green-700"
                          : t === "elegant"
                          ? "bg-purple-700"
                          : t === "minimalist"
                          ? "bg-gray-800"
                          : "bg-pink-600"
                      }`}
                    />
                    <span className="capitalize">{t}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chat Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50"
      >
        {chatHistory.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${
              message.role === "system" 
                ? "px-3 py-2 text-center text-sm text-gray-500" 
                : ""
            }`}
          >
            {message.role !== "system" && (
              <div className={`flex mb-1 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}>
                <div className={`px-3 py-2 rounded-2xl max-w-[85%] ${
                  message.role === "user" 
                    ? "bg-primary text-white" 
                    : "bg-gray-200 text-gray-800"
                }`}>
                  {message.isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse">Generating</div>
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            )}
            
            {/* System messages */}
            {message.role === "system" && (
              <div>{message.content}</div>
            )}
            
            {/* JSON Preview (only for assistant messages with JSON data) */}
            {message.role === "assistant" && message.jsonData && (
              <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg text-xs font-mono">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-700">Generated JSON</span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      title="Copy JSON"
                      onClick={handleCopyJson}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      title="Download JSON"
                      onClick={handleDownloadJson}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-[10px] leading-tight">
                    {JSON.stringify(message.jsonData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-end gap-2">
        <Textarea
          ref={inputRef}
          placeholder={formConfig 
            ? "Describe how you want to modify the form..."
            : "Describe the form you want to create..."}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-20 flex-1 resize-none"
          disabled={isGenerating}
        />
        <Button 
          className="h-10 px-3"
          onClick={() => handleSendMessage(prompt)}
          disabled={isGenerating || !prompt.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Status indicator */}
      <div className="mt-2 flex text-xs text-gray-500 items-center">
        <span className={`w-2 h-2 rounded-full ${statusColor} mr-2`}></span>
        <span>{statusText}</span>
      </div>
    </div>
  );
}
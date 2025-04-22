import { FormConfig } from "@shared/types";

import dotenv from "dotenv";
dotenv.config();

/**
 * This module handles interactions with the Google Gemini API
 * for generating form configurations from natural language prompts
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

// System prompt that instructs Gemini how to structure the form JSON
const SYSTEM_PROMPT = `You are a form generation engine that creates multi-step forms based on natural language prompts.
Output ONLY valid JSON without any explanation or extra text.
You are encouraged to use emojis.
Make sure you extract all keywords from the prompt and include relevant questions that address the user's specific needs.

CRITICAL RULES FOR TITLES AND QUESTIONS:
1. Each title and subtitle MUST be unique across all steps
2. Never repeat the same question in different formats
3. Avoid semantically similar questions (e.g., "What's your budget?" vs "How much can you spend?")
4. Use distinct emojis for each step
5. Ensure each option within tiles/multiSelect steps has a unique title
6. Make each step focus on a distinct aspect of information gathering

Create a form configuration with the following structure:

{
  "theme": {
    "colors": {
      "text": {
        "dark": "#333333",
        "light": "#ecebe4",
        "muted": "#6a6a6a"
      },
      "primary": "#0E565B",
      "background": {
        "light": "#ffffff",
        "white": "#ffffff"
      }
    }
  },
  "steps": [
    // Form steps here with types: tiles, multiSelect, slider, followup, textbox, location, contact
  ],
  "ui": {
    "buttons": {
      "next": "Continue",
      "skip": "Skip",
      "submit": "Submit",
      "startOver": "Start Over",
      "submitting": "Submitting...",
      "check": "Check Availability",
      "checking": "Checking..."
    },
    "messages": {
      "optional": "Optional",
      "required": "Required",
      "invalidEmail": "Please enter a valid email address",
      "submitError": "There was an error submitting your form. Please try again.",
      "thankYou": "Thank You!",
      "submitAnother": "Submit Another Response",
      "multiSelectHint": "Select all that apply",
      "loadError": "Failed to load the form. Please refresh the page.",
      "thisFieldRequired": "This field is required",
      "enterValidEmail": "Please enter a valid email address"
    }
  },
  "submission": {
    "title": "Thank You for Trusting Us! Here's what's Next? 🚀",
    "description": "Thank you for choosing us! Here's our streamlined process to empower your business:",
    "steps": [
      {
        "title": "Checking your Inquiry 📧",
        "description": "We have received your request and will check it instantly."
      },
      {
        "title": "Instant Processing ⏳",
        "description": "Our experts will contact you shortly - give us 1 hour."
      },
      {
        "title": "Personalized Offer 🤝",
        "description": "We'll deliver a personalized offer crafted for your needs."
      }
    ]
  }
}

Follow these strict rules:
1. Each page should have 1-2 elements (except for tiles which can have up to 6)
2. Layout must be designed for 16:9 aspect ratio
3. Use minimal brand colors (1-2 brand colors globally)
4. Use emojis or icons from the lucide-react library
5. Always include a location question asking for postal code and country
6. Always include a contact step to collect user's contact information
7. Each tile or multiSelect step must have exactly 4 or 6 options
8. Keep descriptions under each option very short (less than 4 words)
9. Always use modern, concise language with emojis

For inspiration, refer to enter.de/lead-survey for UX patterns.`;

// Demo form configuration for development (without API key)
const demoFormConfig: FormConfig = {
  theme: {
    colors: {
      text: {
        dark: "#333333",
        light: "#ecebe4",
        muted: "#6a6a6a",
      },
      primary: "#0E565B",
      background: {
        light: "#ffffff",
        white: "#ffffff",
      },
    },
  },
  steps: [
    {
      type: "tiles",
      title: "What are you looking for?",
      subtitle: "Select the option that best describes your needs",
      options: [
        {
          id: "web-design",
          title: "Website Design",
          description: "Professional, modern sites",
          icon: "Laptop",
        },
        {
          id: "mobile-app",
          title: "Mobile App",
          description: "iOS and Android apps",
          icon: "Smartphone",
        },
        {
          id: "branding",
          title: "Brand Identity",
          description: "Logo and brand assets",
          icon: "Palette",
        },
        {
          id: "marketing",
          title: "Digital Marketing",
          description: "Grow your audience",
          icon: "TrendingUp",
        },
      ],
    },
    {
      type: "multiSelect",
      title: "What features do you need?",
      subtitle: "Select all the features you want to include",
      options: [
        {
          id: "responsive",
          title: "Responsive Design",
          description: "Works on all devices",
          icon: "Smartphone",
        },
        {
          id: "ecommerce",
          title: "E-commerce",
          description: "Sell products online",
          icon: "ShoppingCart",
        },
        {
          id: "blog",
          title: "Blog System",
          description: "Content management",
          icon: "FileText",
        },
        {
          id: "analytics",
          title: "Analytics",
          description: "Track performance",
          icon: "BarChart",
        },
      ],
    },
    {
      type: "slider",
      title: "What's your budget?",
      subtitle: "Drag the slider to select your budget range",
      min: 1000,
      max: 10000,
      step: 500,
      defaultValue: 5000,
      prefix: "$",
    },
    {
      type: "textbox",
      title: "Tell us about your project",
      subtitle: "Provide details about what you're looking to achieve",
      placeholder: "Enter project details here...",
      rows: 4,
      validation: {
        required: true,
        minLength: 20,
      },
    },
    {
      type: "location",
      title: "Where are you located?",
      subtitle: "Please enter your location to check service availability",
      config: {
        labels: {
          searchPlaceholder: "Enter your postal code",
        },
      },
      validation: {
        required: true,
      },
    },
    {
      type: "contact",
      title: "Your Contact Information",
      subtitle: "How can we reach you?",
      config: {
        labels: {
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email Address",
          phone: "Phone Number",
        },
        placeholders: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1 (555) 123-4567",
        },
      },
    },
  ],
  ui: {
    buttons: {
      next: "Continue",
      skip: "Skip",
      submit: "Submit",
      startOver: "Start Over",
      submitting: "Submitting...",
      check: "Check Availability",
      checking: "Checking...",
    },
    messages: {
      optional: "Optional",
      required: "Required",
      invalidEmail: "Please enter a valid email address",
      submitError: "There was an error submitting your form. Please try again.",
      thankYou: "Thank You!",
      submitAnother: "Submit Another Response",
      multiSelectHint: "Select all that apply",
      loadError: "Failed to load the form. Please refresh the page.",
      thisFieldRequired: "This field is required",
      enterValidEmail: "Please enter a valid email address",
    },
    contact: {
      title: "Need help?",
      description: "Contact our support team",
      email: "support@example.com",
      phone: "+1 (555) 987-6543",
    },
  },
  submission: {
    title: "Thank You for Your Submission! 🎉",
    description: "We've received your information and will be in touch soon.",
    steps: [
      {
        title: "Request Received ✓",
        description: "We've successfully received your request.",
      },
      {
        title: "Review Process ⏱️",
        description: "Our team is reviewing your submission.",
      },
      {
        title: "Next Steps 🚀",
        description: "We'll contact you within 24 hours with a proposal.",
      },
    ],
  },
};

/**
 * Validates and ensures uniqueness of titles and questions in a form configuration
 * @param config The form configuration to validate
 * @returns The validated and deduplicated form configuration
 */
function validateAndDeduplicateForm(config: FormConfig): FormConfig {
  const usedTitles = new Set<string>();
  const usedSubtitles = new Set<string>();
  const usedEmojis = new Set<string>();

  // Helper to extract emoji from string
  const getEmoji = (str: string) => {
    const emojiRegex = /[\p{Emoji}]/gu;
    const matches = str.match(emojiRegex);
    return matches ? matches[0] : null;
  };

  // Helper to make title unique
  const makeUnique = (title: string, set: Set<string>): string => {
    let newTitle = title;
    let counter = 1;
    while (set.has(newTitle)) {
      // If title has emoji, preserve it
      const emoji = getEmoji(title);
      const baseTitle = emoji ? title.replace(emoji, "").trim() : title;
      newTitle = `${baseTitle} ${counter}${emoji ? ` ${emoji}` : ""}`;
      counter++;
    }
    return newTitle;
  };

  // Process each step
  config.steps = config.steps.map((step) => {
    // Make title unique
    step.title = makeUnique(step.title, usedTitles);
    usedTitles.add(step.title);

    // Make subtitle unique
    step.subtitle = makeUnique(step.subtitle, usedSubtitles);
    usedSubtitles.add(step.subtitle);

    // Handle options for tiles and multiSelect steps
    if ("options" in step && Array.isArray(step.options)) {
      const usedOptionTitles = new Set<string>();

      step.options = step.options.map((option) => {
        option.title = makeUnique(option.title, usedOptionTitles);
        usedOptionTitles.add(option.title);
        return option;
      });
    }

    return step;
  });

  return config;
}

/**
 * Generates a form configuration from a natural language prompt using Gemini API
 * @param prompt The natural language prompt describing the form to generate
 * @returns FormConfig object representing the generated form structure
 */
export async function generateFormFromPrompt(
  prompt: string,
): Promise<FormConfig> {
  // Create a customized demo form based on prompt for fallback
  const customDemoForm = createCustomizedDemoForm(prompt);

  // Verify GEMINI_API_KEY is available
  if (!GEMINI_API_KEY) {
    console.warn(
      "GEMINI_API_KEY environment variable not set - using demo form configuration",
    );
    return validateAndDeduplicateForm(customDemoForm);
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nNow create a form for the following request:\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      console.error(
        `Gemini API HTTP error: ${response.status} ${response.statusText}`,
      );
      try {
        const errorData = await response.json();
        console.error(`Gemini API error details: ${JSON.stringify(errorData)}`);
      } catch (e) {
        const errorText = await response.text();
        console.error(`Gemini API error response: ${errorText}`);
      }

      return validateAndDeduplicateForm(customDemoForm);
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0]
    ) {
      console.error(
        "Unexpected response structure from Gemini API:",
        JSON.stringify(data),
      );
      return validateAndDeduplicateForm(customDemoForm);
    }

    const textResponse = data.candidates[0].content.parts[0].text;

    if (!textResponse) {
      console.error("Empty response from Gemini API");
      return validateAndDeduplicateForm(customDemoForm);
    }

    try {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : textResponse;

      let formConfig = JSON.parse(jsonString) as FormConfig;

      if (
        !formConfig.steps ||
        !Array.isArray(formConfig.steps) ||
        formConfig.steps.length === 0
      ) {
        console.warn("Invalid form configuration detected, attempting one retry...");
        // One retry attempt
        try {
          const retryResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${SYSTEM_PROMPT}\n\nThis is a retry attempt. Please ensure valid form structure for the following request:\n${prompt}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1, // Reduced temperature for more focused output
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 8192,
              },
            }),
          });

          const retryData = await retryResponse.json();
          const retryText = retryData.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (retryText) {
            const retryJsonMatch = retryText.match(/\{[\s\S]*\}/);
            const retryConfig = JSON.parse(retryJsonMatch ? retryJsonMatch[0] : retryText);
            
            if (retryConfig.steps && Array.isArray(retryConfig.steps) && retryConfig.steps.length > 0) {
              formConfig = retryConfig;
            } else {
              console.error("Retry attempt failed: still invalid form configuration");
              return validateAndDeduplicateForm(customDemoForm);
            }
          } else {
            console.error("Retry attempt failed: empty response");
            return validateAndDeduplicateForm(customDemoForm);
          }
        } catch (retryError) {
          console.error("Retry attempt failed:", retryError);
          return validateAndDeduplicateForm(customDemoForm);
        }
      }

      // Fix inconsistent property naming in steps
      formConfig.steps = formConfig.steps.map((step) => {
        if ("label" in step && !("title" in step)) {
          (step as any).title = (step as any).label;
          delete (step as any).label;
        } else if ("question" in step && !("title" in step)) {
          (step as any).title = (step as any).question;
          delete (step as any).question;
        }

        if ("field" in step && !("subtitle" in step)) {
          (step as any).subtitle = `Please select your ${(step as any).field}`;
          delete (step as any).field;
        } else if ("description" in step && !("subtitle" in step)) {
          (step as any).subtitle = (step as any).description;
          delete (step as any).description;
        }

        if (step.type === "tiles" || step.type === "multiSelect") {
          if ("options" in step) {
            const options = (step as any).options;
            if (Array.isArray(options)) {
              (step as any).options = options.map((opt: any) => ({
                id:
                  opt.value ||
                  opt.id ||
                  `option-${Math.random().toString(36).substring(2, 9)}`,
                title: opt.label || opt.title || "Option",
                description: opt.description || "",
                icon: opt.icon || "CheckCircle",
              }));
            }
          }
        }

        if (step.type === "location") {
          if (!("config" in step)) {
            (step as any).config = {
              labels: {
                searchPlaceholder: "Enter your postal code",
              },
            };
          }

          if (!("validation" in step) && "required" in step) {
            (step as any).validation = {
              required: (step as any).required,
            };
            delete (step as any).required;
          }
        }

        if (step.type === "slider") {
          if ("required" in step) {
            delete (step as any).required;
          }

          if (!("min" in step)) (step as any).min = 0;
          if (!("max" in step)) (step as any).max = 100;
          if (!("step" in step)) (step as any).step = 1;
          if (!("defaultValue" in step)) (step as any).defaultValue = 50;
        }

        if (step.type === "contact") {
          if (!("config" in step)) {
            (step as any).config = {
              labels: {
                firstName: "First Name",
                lastName: "Last Name",
                email: "Email Address",
                phone: "Phone Number",
              },
              placeholders: {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phone: "+1 (555) 123-4567",
              },
            };
          }

          if ("fields" in step && Array.isArray((step as any).fields)) {
            const fields = (step as any).fields;

            fields.forEach((field: any) => {
              if (field.field === "name" || field.field === "firstName") {
                (step as any).config.labels.firstName =
                  field.label || "First Name";
                if (field.placeholder) {
                  (step as any).config.placeholders.firstName =
                    field.placeholder;
                }
              } else if (field.field === "lastName") {
                (step as any).config.labels.lastName =
                  field.label || "Last Name";
                if (field.placeholder) {
                  (step as any).config.placeholders.lastName =
                    field.placeholder;
                }
              } else if (field.field === "email") {
                (step as any).config.labels.email =
                  field.label || "Email Address";
                if (field.placeholder) {
                  (step as any).config.placeholders.email = field.placeholder;
                }
              } else if (field.field === "phone") {
                (step as any).config.labels.phone =
                  field.label || "Phone Number";
                if (field.placeholder) {
                  (step as any).config.placeholders.phone = field.placeholder;
                }
              }
            });

            delete (step as any).fields;
          }

          if ("name" in step) {
            const nameConfig = (step as any).name;
            if (nameConfig && typeof nameConfig === "object") {
              (step as any).config.labels.firstName =
                nameConfig.label || "First Name";
              if (nameConfig.placeholder) {
                (step as any).config.placeholders.firstName =
                  nameConfig.placeholder;
              }
            }
            delete (step as any).name;
          }

          if ("email" in step) {
            const emailConfig = (step as any).email;
            if (emailConfig && typeof emailConfig === "object") {
              (step as any).config.labels.email =
                emailConfig.label || "Email Address";
              if (emailConfig.placeholder) {
                (step as any).config.placeholders.email =
                  emailConfig.placeholder;
              }
            }
            delete (step as any).email;
          }

          if ("phone" in step) {
            const phoneConfig = (step as any).phone;
            if (phoneConfig && typeof phoneConfig === "object") {
              (step as any).config.labels.phone =
                phoneConfig.label || "Phone Number";
              if (phoneConfig.placeholder) {
                (step as any).config.placeholders.phone =
                  phoneConfig.placeholder;
              }
            }
            delete (step as any).phone;
          }
        }

        return step;
      });

      if (!formConfig.ui) {
        formConfig.ui = demoFormConfig.ui;
      }

      if (!formConfig.submission) {
        formConfig.submission = demoFormConfig.submission;
      }

      function reorderFinalSteps(config: FormConfig): FormConfig {
        const steps = config.steps;

        if (!Array.isArray(steps)) return config;

        const contactStepIndex = steps.findIndex((s) => s.type === "contact");
        const locationStepIndex = steps.findIndex((s) => s.type === "location");

        const contactStep =
          contactStepIndex !== -1 ? steps.splice(contactStepIndex, 1)[0] : null;
        const locationStep =
          locationStepIndex !== -1
            ? steps.splice(
                locationStepIndex < contactStepIndex
                  ? locationStepIndex
                  : locationStepIndex - 1,
                1,
              )[0]
            : null;

        // Now push them to the right place
        if (locationStep) steps.push(locationStep);
        if (contactStep) steps.push(contactStep);

        config.steps = steps;

        return config;
      }

      formConfig = reorderFinalSteps(formConfig);

      // Validate and deduplicate the form configuration
      return validateAndDeduplicateForm(formConfig);
    } catch (parseError) {
      console.error("Error parsing Gemini response as JSON:", parseError);
      console.warn("Using demo form configuration due to parsing error");
      return validateAndDeduplicateForm(customDemoForm);
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    console.warn("Using demo form configuration due to API error");
    return validateAndDeduplicateForm(customDemoForm);
  }
}

/**
 * Creates a customized version of the demo form based on the prompt
 * @param prompt The natural language prompt
 * @returns A customized form configuration
 */
function createCustomizedDemoForm(prompt: string): FormConfig {
  const customForm: FormConfig = JSON.parse(JSON.stringify(demoFormConfig));

  const promptLower = prompt.toLowerCase();

  if (customForm.steps && customForm.steps.length > 0) {
    const firstStep = customForm.steps[0];

    const promptWords = prompt.split(" ");

    if (promptWords.length > 5) {
      firstStep.title = promptWords.slice(0, 5).join(" ") + "...";
    } else {
      firstStep.title = prompt;
    }

    firstStep.subtitle = "Tell us about your needs";

    if (customForm.submission) {
      customForm.submission.title = "Thank You for Your Submission! 🎉";
      customForm.submission.description =
        "We've received your information and will be in touch soon about your request.";
    }

    if (
      promptLower.includes("product") ||
      promptLower.includes("service") ||
      promptLower.includes("offering") ||
      promptLower.includes("solution")
    ) {
      if (firstStep.type === "tiles") {
        firstStep.title = "What are you interested in?";

        if (
          promptLower.includes("web") ||
          promptLower.includes("website") ||
          promptLower.includes("application")
        ) {
          firstStep.options[0].title = "Website Development";
          firstStep.options[0].icon = "Globe";
        }

        if (promptLower.includes("consult") || promptLower.includes("advice")) {
          firstStep.options[1].title = "Consultation";
          firstStep.options[1].icon = "HelpCircle";
        }

        if (promptLower.includes("support") || promptLower.includes("help")) {
          firstStep.options[2].title = "Technical Support";
          firstStep.options[2].icon = "LifeBuoy";
        }
      }
    }

    const contactStep = customForm.steps.find(
      (step) => step.type === "contact",
    );
    if (contactStep) {
      contactStep.title = "Your Contact Information";
      contactStep.subtitle = "How can we reach you about your request?";
    }
  }

  return customForm;
}

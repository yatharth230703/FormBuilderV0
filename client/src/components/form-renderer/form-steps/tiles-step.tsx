import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { TilesStep as TilesStepType } from "@shared/types";

interface TilesStepProps {
  step: TilesStepType;
}

const EMOJI_ICON_MAP = [
  { keywords: ["excellent", "perfect", "amazing"], icon: "🤩" },
  { keywords: ["good", "satisfied", "nice"], icon: "🙂" },
  { keywords: ["average", "neutral", "okay"], icon: "😐" },
  { keywords: ["poor", "bad", "terrible", "dissatisfied"], icon: "😞" },
  { keywords: ["spotless", "clean", "tidy"], icon: "🧼" },
  { keywords: ["unclean", "dirty", "messy"], icon: "🧹" },
  { keywords: ["fast", "quick", "instant"], icon: "⚡" },
  { keywords: ["slow", "long", "waiting"], icon: "🐢" },
  { keywords: ["helpful", "friendly", "assistance"], icon: "🙋‍♀️" },
  { keywords: ["unhelpful", "ignored", "rude"], icon: "🙅" },
  { keywords: ["feedback", "comment", "suggestion"], icon: "📝" },
  { keywords: ["location", "postal", "country"], icon: "📍" },
  { keywords: ["contact", "email", "phone"], icon: "📧" },
  { keywords: ["clothing", "variety", "apparel"], icon: "👕" },
  { keywords: ["price", "budget", "cost"], icon: "💰" },
  { keywords: ["food", "restaurant", "dining"], icon: "🍽️" },
  { keywords: ["ambience", "vibe", "atmosphere"], icon: "🎭" },
  { keywords: ["energy", "solar", "power"], icon: "⚡" }
];

const getEmojiForTitle = (title: string) => {
  const lower = title.toLowerCase();
  for (const { keywords, icon } of EMOJI_ICON_MAP) {
    if (keywords.some(k => lower.includes(k))) return icon;
  }
  return "✅";
};

export default function TilesStep({ step }: TilesStepProps) {
  const { updateResponse, formResponses, currentStep, nextStep } = useFormContext();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    const savedResponse = formResponses[step.title];
    if (savedResponse) {
      setSelectedOption(savedResponse);
    } else {
      setSelectedOption(null);
    }
  }, [formResponses, step.title, currentStep]);

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
    updateResponse(step.title, optionId);
    setTimeout(() => nextStep(), 300);
  };

  // Set grid columns conditionally: if 4 options, use 2 columns; otherwise (i.e. 6 options) use 3 columns.
  const gridClasses =
    step.options.length === 4
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

  return (
    <div className="flex-1 flex flex-col py-4">
      <h3 className="text-2xl font-bold mb-2 text-center">{step.title}</h3>
      <p className="text-gray-500 mb-8 text-center">{step.subtitle}</p>

      <div className={`grid ${gridClasses} gap-4 max-w-5xl mx-auto`}>
        {step.options.map((option) => {
          const emoji = getEmojiForTitle(option.title);
          const isActive = selectedOption === option.id;

          return (
            <div
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              className={`border rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-36
                ${isActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"}`}
            >
              <span className="text-3xl mb-2">{emoji}</span>
              <div className="text-base font-medium">{option.title}</div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

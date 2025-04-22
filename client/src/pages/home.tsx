import { useEffect } from "react";
import LeftPanel from "@/components/left-panel";
import RightPanel from "@/components/right-panel";
import { FormProvider } from "@/contexts/form-context";

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50">
      <FormProvider>
        <LeftPanel />
        <RightPanel />
      </FormProvider>
    </div>
  );
}

import { UnifiedAssistant } from "@/components/UnifiedAssistant";

export const metadata = {
  title: "AI Farm Assistant | CropIntel AI",
  description: "Interact with the AI Farm Assistant using text or voice.",
};

export default function AssistantPage() {
  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
      <div className="container py-8">
        <UnifiedAssistant />
      </div>
    </div>
  );
}

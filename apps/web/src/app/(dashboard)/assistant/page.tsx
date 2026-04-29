import { AssistantChat } from "@/components/assistant/AssistantChat";

export default function AssistantPage() {
  return (
    <div className="flex h-full flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assistant CogirIA</h1>
        <p className="text-sm text-gray-500">
          Posez vos questions comptables, obtenez des réponses instantanées
        </p>
      </div>
      <div className="flex-1">
        <AssistantChat />
      </div>
    </div>
  );
}

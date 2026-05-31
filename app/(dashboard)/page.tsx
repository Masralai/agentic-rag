import { EmptyState } from "@/components/empty-state";

export default function DashboardPage() {
  return (
    <EmptyState
      title="Select a node"
      description="Choose a node from the sidebar or create a new one to get started."
    />
  );
}

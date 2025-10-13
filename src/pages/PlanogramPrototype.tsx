import PlanogramDesigner from '@/features/planogram/components/PlanogramDesigner';

interface PlanogramPrototypeProps {
  onBackToDashboard?: () => void;
}

export default function PlanogramPrototype({ onBackToDashboard }: PlanogramPrototypeProps) {
  return <PlanogramDesigner onBackToDashboard={onBackToDashboard} />;
}

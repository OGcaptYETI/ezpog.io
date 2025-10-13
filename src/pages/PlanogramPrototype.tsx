import PlanogramDesigner from '@/features/planogram/components/PlanogramDesigner';

interface PlanogramPrototypeProps {
  onBackToDashboard?: () => void;
}

// Default props
PlanogramPrototype.defaultProps = {
  onBackToDashboard: () => window.location.href = '/',
};

export default function PlanogramPrototype({ onBackToDashboard }: PlanogramPrototypeProps) {
  return <PlanogramDesigner onBackToDashboard={onBackToDashboard} />;
}

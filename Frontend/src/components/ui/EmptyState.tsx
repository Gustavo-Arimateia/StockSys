import {
  PackageOpen,
  type LucideIcon,
} from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
};

export default function EmptyState({
  title,
  description,
  icon: Icon = PackageOpen,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Icon size={24} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-text">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </div>
  );
}
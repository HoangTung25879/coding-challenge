// src/components/ui/Skeleton.tsx
import { Loader2 } from 'lucide-react';

type Props = {
  className?: string;
};

export function Skeleton({ className = '' }: Props) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export function LeadCardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

export function DrawerLoadingFallback() {
  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl items-center justify-center bg-white shadow-xl">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  );
}

export function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-6">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    </div>
  );
}

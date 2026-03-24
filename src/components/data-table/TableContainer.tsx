import { forwardRef, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  isRefetching?: boolean;
};

export const TableContainer = forwardRef<HTMLDivElement, Props>(function TableContainer(
  { children, isRefetching },
  ref
) {
  return (
    <div
      ref={ref}
      className="relative overflow-auto overscroll-none rounded-lg border border-gray-200 bg-white"
      style={{ height: 'calc(37px + 10 * 44px + 17px)' }}
    >
      {isRefetching && (
        <div className="absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden">
          <div className="h-full w-1/3 animate-[slide_1s_ease-in-out_infinite] bg-blue-500" />
        </div>
      )}
      {children}
    </div>
  );
});

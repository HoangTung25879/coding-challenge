import { useState, useRef, useEffect, type ReactNode, type ReactElement } from 'react';

type DropdownProps = {
  trigger: ReactElement;
  children: ReactNode;
  align?: 'left' | 'right';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export function Dropdown({
  trigger,
  children,
  align = 'left',
  open: controlledOpen,
  onOpenChange,
  className = '',
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const ref = useRef<HTMLDivElement>(null);

  function setOpen(next: boolean) {
    if (isControlled) {
      onOpenChange?.(next);
    } else {
      setInternalOpen(next);
      onOpenChange?.(next);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  function handleTriggerClick() {
    setOpen(!isOpen);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div onClick={handleTriggerClick}>{trigger}</div>
      {isOpen && (
        <div
          className={`absolute top-full z-30 mt-1 rounded-lg border border-gray-200 bg-white py-1 shadow-lg ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

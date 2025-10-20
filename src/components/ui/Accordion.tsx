import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
}

export function AccordionItem({ title, icon, children, defaultOpen = false, badge }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg mb-3 bg-white shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-indigo-600">{icon}</div>}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {badge !== undefined && (
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
              {badge}
            </span>
          )}
        </div>
        <div className="text-gray-400">
          {isOpen ? (
            <ChevronDown className="w-5 h-5 transition-transform" />
          ) : (
            <ChevronRight className="w-5 h-5 transition-transform" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 py-4 border-t border-gray-200 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}

interface AccordionProps {
  children: React.ReactNode;
}

export function Accordion({ children }: AccordionProps) {
  return <div className="space-y-3">{children}</div>;
}

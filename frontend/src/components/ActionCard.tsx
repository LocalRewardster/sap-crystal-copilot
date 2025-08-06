'use client';

import { ReactNode } from 'react';

interface ActionCardProps {
  icon: ReactNode;
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
}

export default function ActionCard({ 
  icon, 
  label, 
  variant = 'primary', 
  onClick,
  className = '' 
}: ActionCardProps) {
  const baseClasses = "w-full h-14 rounded-lg flex items-center px-4 space-x-3 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2";
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus-visible:outline-blue-600",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 focus-visible:outline-gray-600"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}
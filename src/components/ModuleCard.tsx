
import React from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface ModuleCardProps {
  title: string;
  description: string;
  to: string;
  progress?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ 
  title, 
  description, 
  to, 
  progress, 
  icon, 
  disabled = false
}) => {
  const content = (
    <Card className={`p-6 h-full transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md'}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 mb-3">
          {icon && <div className="text-horizon-red">{icon}</div>}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-4 flex-grow">{description}</p>
        
        {progress !== undefined && (
          <div className="mt-auto">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-horizon-red" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
  
  if (disabled) {
    return content;
  }
  
  return (
    <Link to={to} className="block h-full">
      {content}
    </Link>
  );
};

export default ModuleCard;

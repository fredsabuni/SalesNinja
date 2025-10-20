/**
 * MobileNavigation - Bottom navigation for mobile devices
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number;
}

export interface MobileNavigationProps {
  items: NavigationItem[];
  activeItem?: string;
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  activeItem,
  className,
}) => {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-2 safe-area-pb',
        className
      )}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const isActive = activeItem === item.id;
          
          const handleClick = () => {
            if (item.onClick) {
              item.onClick();
            } else if (item.href) {
              window.location.href = item.href;
            }
          };

          return (
            <button
              key={item.id}
              onClick={handleClick}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-touch min-h-touch',
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
              )}
            >
              <div className="relative">
                <div className="h-6 w-6">
                  {item.icon}
                </div>
                
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              
              <span className="text-xs font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export { MobileNavigation };
import React, { useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon as ExclamationTriangleSolid } from '@heroicons/react/24/solid';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actions?: string[];
  timestamp?: Date;
  autoHide?: boolean;
  level?: 'critical' | 'warning' | 'info';
}

interface MobileAlertProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

const MobileAlert: React.FC<MobileAlertProps> = ({ alerts, onDismiss }) => {
  // Auto-dismiss non-critical alerts after 4 seconds
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    alerts.forEach((alert) => {
      if (alert.level !== 'critical' && alert.type !== 'critical') {
        const timer = setTimeout(() => {
          onDismiss(alert.id);
        }, 3000); // Changed from 10000 to 4000 (4 seconds)
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [alerts, onDismiss]);
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <ExclamationTriangleSolid className="h-5 w-5 text-red-600 flex-shrink-0" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />;
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-900 shadow-red-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900 shadow-yellow-100';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900 shadow-blue-100';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900 shadow-green-100';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <>
      {/* Desktop Alert Container */}
  <div className="hidden lg:block fixed top-4 right-4 z-50 space-y-3 max-w-md pointer-events-none">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`
              rounded-lg border p-4 shadow-lg backdrop-blur-sm
              ${getAlertStyles(alert.type)}
              transform transition-all duration-300 ease-in-out
              animate-slide-down max-w-sm
    pointer-events-auto`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold mb-1 leading-tight">
                    {alert.title}
                  </h4>
                  <p className="text-xs leading-relaxed opacity-90">
                    {alert.message}
                  </p>
                  {alert.actions && alert.actions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Required Actions:</p>
                      <ul className="text-xs space-y-1">
                        {alert.actions.slice(0, 3).map((action, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="w-1 h-1 bg-current rounded-full flex-shrink-0 mt-1.5"></span>
                            <span className="line-clamp-2">{action}</span>
                          </li>
                        ))}
                        {alert.actions.length > 3 && (
                          <li className="text-xs opacity-70">+{alert.actions.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="ml-3 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors flex-shrink-0 pointer-events-auto"
                aria-label="Dismiss alert"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Alert Container - Adjusted positioning */}
  <div className="lg:hidden fixed top-16 left-2 right-2 z-50 space-y-2 pointer-events-none">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`
              rounded-lg border p-3 shadow-lg backdrop-blur-sm
              ${getAlertStyles(alert.type)}
              transform transition-all duration-300 ease-in-out
              animate-slide-down
    pointer-events-auto`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2 flex-1 min-w-0">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold mb-1 leading-tight">
                    {alert.title}
                  </h4>
                  <p className="text-xs leading-relaxed opacity-90">
                    {alert.message}
                  </p>
                  {alert.actions && alert.actions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Actions:</p>
                      <ul className="text-xs space-y-1">
                        {alert.actions.slice(0, 2).map((action, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="w-1 h-1 bg-current rounded-full flex-shrink-0 mt-1.5"></span>
                            <span className="line-clamp-1">{action}</span>
                          </li>
                        ))}
                        {alert.actions.length > 2 && (
                          <li className="text-xs opacity-70">+{alert.actions.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {alert.timestamp && (
                    <p className="text-xs opacity-70 mt-1">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors flex-shrink-0 pointer-events-auto"
                aria-label="Dismiss alert"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MobileAlert;

import { ReactNode } from 'react';
import RunningModeBadge from '../../../components/RunningModeBadge';

interface ActionCardProps {
  circleBgClass: string;
  Icon: (props: { className?: string }) => ReactNode;
  iconClass: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonClass: string;
  onClick: () => void;
  horizontal?: boolean;
  runningMode?: string;
}

export default function ActionCard({
  circleBgClass,
  Icon,
  iconClass,
  title,
  description,
  buttonLabel,
  buttonClass,
  onClick,
  horizontal = false,
  runningMode
}: ActionCardProps) {
  if (horizontal) {
    return (
      <div data-cy="action-card" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow">
        <div className="flex items-center gap-6">
          <div className={`flex items-center justify-center w-16 h-16 flex-shrink-0 ${circleBgClass} rounded-full`}>
            <Icon className={iconClass} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              {runningMode && (
                <RunningModeBadge mode={runningMode} variant="outlined" />
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {description}
            </p>
          </div>
          <button
            onClick={onClick}
            className={`px-6 py-3 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex-shrink-0 ${buttonClass}`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-cy="action-card" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow flex flex-col">
      <div className="text-center flex flex-col h-full">
        <div className={`flex items-center justify-center w-16 h-16 ${circleBgClass} rounded-full mb-4 mx-auto`}>
          <Icon className={iconClass} />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          {runningMode && (
            <RunningModeBadge mode={runningMode} />
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
          {description}
        </p>
        <button
          onClick={onClick}
          className={`w-full px-6 py-3 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 mt-auto ${buttonClass}`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}



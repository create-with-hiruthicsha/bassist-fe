import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

/** Top bar: back button only. Title and description go in the page body. */
const HEADER_CLASSES =
  'border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800';
const HEADER_CONTENT_CLASSES = 'max-w-4xl mx-auto px-4 sm:px-6 py-3';
const BACK_BUTTON_CLASSES =
  'flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors';

export interface PageHeaderProps {
  /** Path to navigate to (e.g. '/') or -1 for history.back() */
  backTo: string | number;
}

export default function PageHeader({ backTo }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof backTo === 'number') {
      navigate(backTo);
    } else {
      navigate(backTo);
    }
  };

  return (
    <header className={HEADER_CLASSES}>
      <div className={HEADER_CONTENT_CLASSES}>
        <button
          type="button"
          onClick={handleBack}
          className={BACK_BUTTON_CLASSES}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
    </header>
  );
}

export const pageMainClasses = 'max-w-4xl mx-auto px-4 sm:px-6 py-8';

/** Title and optional subtitle for the top of the page body (use below PageHeader). */
export interface PageTitleProps {
  title: ReactNode;
  subtitle?: ReactNode;
}

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h1>
      {subtitle != null && (
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          {subtitle}
        </p>
      )}
    </div>
  );
}

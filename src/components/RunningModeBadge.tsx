interface RunningModeBadgeProps {
  mode: string;
  variant?: 'default' | 'outlined';
  className?: string;
}

export default function RunningModeBadge({ 
  mode, 
  variant = 'default',
  className = '' 
}: RunningModeBadgeProps) {
  const isBeta = mode.toLowerCase() === 'beta';
  
  const baseClasses = 'px-2 py-1 text-xs rounded-full';
  const fontClass = variant === 'outlined' ? 'font-small' : 'font-medium';
  
  const colorClasses = isBeta
    ? variant === 'outlined'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 outline outline-1 outline-blue-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    : variant === 'outlined'
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 outline outline-1 outline-purple-200'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';

  return (
    <span className={`${baseClasses} ${fontClass} ${colorClasses} ${className}`}>
      {mode}
    </span>
  );
}

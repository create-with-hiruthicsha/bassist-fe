interface PageLoaderProps {
	message?: string;
}

export default function PageLoader({ message }: PageLoaderProps) {
	return (
		<div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
			<div className="relative">
				<div className="h-16 w-16 rounded-full border-4 border-blue-100 dark:border-blue-900/30"></div>
				<div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-blue-600 dark:border-blue-500 border-t-transparent animate-spin"></div>
			</div>
			{message && (
				<p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse">
					{message}
				</p>
			)}
		</div>
	);
}

import { ExternalLink } from "lucide-react";

export default function ManageIntegrationsButton({ onIntegrationsModalOpen }: { onIntegrationsModalOpen: (open: boolean) => void }) {
	return (
		<button
			onClick={() => onIntegrationsModalOpen(true)}
			className="flex items-center gap-2 px-6 py-3 bg-gray-700 dark:bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700 dark:focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
		>
			<ExternalLink className="w-4 h-4" />
			Manage Integrations
		</button>
	);
}
import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Trash2, Loader2, Check, ExternalLink } from 'lucide-react';
import { useApiKeys } from '../hooks/useApi';
import toast from 'react-hot-toast';

export default function APIKeyManager() {
	const { apiKeys, listApiKeys, upsertApiKey, deleteApiKey } = useApiKeys();
	const [geminiKey, setGeminiKey] = useState('');
	const [showKey, setShowKey] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		listApiKeys();
	}, [listApiKeys]);

	const hasGeminiKey = apiKeys.includes('gemini');

	const handleSave = async () => {
		if (!geminiKey) {
			toast.error('Please enter an API key');
			return;
		}

		setIsSaving(true);
		try {
			const result = await upsertApiKey('gemini', geminiKey);
			if (result?.success) {
				toast.success(result.message);
				setGeminiKey('');
				listApiKeys();
			}
		} catch (err) {
			toast.error('Failed to save API key');
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm('Are you sure you want to delete your Gemini API key?')) return;

		try {
			const result = await deleteApiKey('gemini');
			if (result?.success) {
				toast.success(result.message);
				listApiKeys();
			}
		} catch (err) {
			toast.error('Failed to delete API key');
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
					API Keys (Optional)
				</h3>
			</div>

			<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-sm transition-shadow">
				<div className="flex items-start gap-4">
					<div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
						<Key className="w-6 h-6" />
					</div>

					<div className="flex-1 space-y-4">
						<div>
							<div className="flex items-center gap-2">
								<h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
									Gemini API Key
								</h4>
								{hasGeminiKey && (
									<div className="flex items-center gap-1 text-green-600 dark:text-green-400">
										<Check className="w-3.5 h-3.5" />
										<span className="text-[10px] font-bold uppercase tracking-wider">Configured</span>
									</div>
								)}
							</div>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
								Provide your own Google Gemini API key to use for background tasks. If not provided, the system default will be used.
							</p>
						</div>

						<div className="flex items-center gap-2">
							<div className="relative flex-1">
								<input
									type={showKey ? 'text' : 'password'}
									placeholder={hasGeminiKey ? '••••••••••••••••' : 'Enter your Gemini API key'}
									value={geminiKey}
									onChange={(e) => setGeminiKey(e.target.value)}
									className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
								/>
								<button
									onClick={() => setShowKey(!showKey)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
								>
									{showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
								</button>
							</div>

							<div className="flex items-center gap-2">
								<button
									onClick={handleSave}
									disabled={isSaving || !geminiKey}
									className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50"
								>
									{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
									Save
								</button>
								{hasGeminiKey && (
									<button
										onClick={handleDelete}
										className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								)}
							</div>
						</div>

						<div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
							<ExternalLink className="w-3.5 h-3.5" />
							<a
								href="https://aistudio.google.com/app/apikey"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:underline"
							>
								Get your API key from Google AI Studio
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

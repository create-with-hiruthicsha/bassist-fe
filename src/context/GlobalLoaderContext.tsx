import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import PageLoader from '../components/PageLoader';

interface GlobalLoaderContextType {
	showLoader: (message?: string) => void;
	hideLoader: () => void;
	isLoaderVisible: boolean;
}

const GlobalLoaderContext = createContext<GlobalLoaderContextType | undefined>(undefined);

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
	const [isVisible, setIsVisible] = useState(false);
	const [message, setMessage] = useState<string | undefined>();

	const showLoader = useCallback((msg?: string) => {
		setMessage(msg);
		setIsVisible(true);
	}, []);

	const hideLoader = useCallback(() => {
		setIsVisible(false);
		setMessage(undefined);
	}, []);

	return (
		<GlobalLoaderContext.Provider value={{ showLoader, hideLoader, isLoaderVisible: isVisible }}>
			{children}
			{isVisible && <PageLoader message={message} />}
		</GlobalLoaderContext.Provider>
	);
}

export function useGlobalLoader() {
	const context = useContext(GlobalLoaderContext);
	if (context === undefined) {
		throw new Error('useGlobalLoader must be used within a GlobalLoaderProvider');
	}
	return context;
}

export const styles = {
    container: "min-h-screen bg-white dark:bg-gray-900",
    header: "border-b border-gray-100 dark:border-gray-800",
    headerContent: "max-w-6xl mx-auto px-4 sm:px-6 py-6",
    backButton: "flex items-center gap-2 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
    backIcon: "w-5 h-5",
    backText: "text-base font-medium",

    main: "max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12",

    titleSection: "mb-8 sm:mb-12",
    title: "text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2",
    subtitle: "text-sm sm:text-base text-gray-600 dark:text-gray-400",

    contentSpace: "space-y-6",

    card: "bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6",

    section: {
        label: "block text-sm font-medium text-gray-900 dark:text-gray-100 mb-4",
        title: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-4",
        grid: "grid grid-cols-1 sm:grid-cols-2 gap-4",
    },

    input: "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700",

    platform: {
        grid: "grid grid-cols-2 gap-3",
        button: {
            active: "px-4 py-3 rounded-lg font-medium text-sm transition-all bg-blue-700 text-white shadow-lg",
            connected: "px-4 py-3 rounded-lg font-medium text-sm transition-all bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600",
            disabled: "px-4 py-3 rounded-lg font-medium text-sm transition-all bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed grayscale",
        },
        subText: "block text-xs mt-1 opacity-70",
    },

    error: {
        container: "flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg",
        icon: "w-5 h-5",
        text: "text-sm",
    },

    success: {
        container: "flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-lg",
        icon: "w-5 h-5",
        content: "flex-1",
        title: "text-sm font-medium",
        link: "text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1 link-icon", // Link with icon needs helper?
        linkIcon: "w-3 h-3",
        meta: "text-xs text-gray-600 dark:text-gray-400 mt-1",
    },

    issueList: {
        header: "flex items-center justify-between mb-4",
        title: "text-sm font-medium text-gray-900 dark:text-gray-100",
        spinner: "w-4 h-4 text-gray-400 animate-spin",
        empty: "text-sm text-gray-600 dark:text-gray-400 text-center py-8",
        container: "space-y-3",
    },

    issue: {
        container: "bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600",
        layout: "flex items-start justify-between gap-4",
        content: "flex-1 min-w-0",
        header: "flex items-center gap-2 mb-2",
        title: "text-sm font-medium text-gray-900 dark:text-gray-100 truncate",
        badge: {
            open: "text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
            other: "text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
        },
        description: "text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2",
        meta: "text-xs text-gray-500 dark:text-gray-500",
        button: "flex-shrink-0 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
        buttonIcon: "w-4 h-4",
        spinner: "w-4 h-4 animate-spin",
    }
};

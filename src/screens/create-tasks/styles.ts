export const styles = {
    container: "min-h-screen bg-white dark:bg-gray-900",
    header: "border-b border-gray-100 dark:border-gray-800",
    headerContent: "max-w-6xl mx-auto px-4 sm:px-6 py-6",
    backButton: "flex items-center gap-2 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
    backIcon: "w-5 h-5",
    backText: "text-base font-medium",

    main: "max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12",

    titleSection: "mb-8 sm:mb-12",
    title: "text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2",
    subtitle: "text-sm sm:text-base text-gray-600 dark:text-gray-400",

    contentSpace: "space-y-6",

    section: {
        container: "bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6",
        title: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-4",
        label: "block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2",
        marginBottom: "mb-4",
    },

    input: {
        textarea: "w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent resize-none font-mono text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700",
    },

    options: {
        container: "flex items-center gap-3 cursor-pointer",
        checkbox: "w-5 h-5 text-blue-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-700 dark:focus:ring-blue-400",
        label: "text-sm text-gray-900 dark:text-gray-100",
    },

    summary: {
        container: "bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6",
        header: "flex items-center justify-between mb-4",
        title: "text-sm font-medium text-gray-900 dark:text-gray-100",
        count: "text-sm text-gray-600 dark:text-gray-400",
        grid: "grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4",
        value: "text-gray-700 dark:text-gray-300 font-medium",
        label: "text-gray-600 dark:text-gray-400 ml-1",
        listContainer: "space-y-2",
        epicCard: "text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 px-3 py-2 rounded",
        epicName: "font-medium",
        epicCount: "text-xs text-gray-500 dark:text-gray-400",
        moreEpics: "text-sm text-gray-500 dark:text-gray-400 px-3 py-2",
    },

    progress: {
        container: "bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6",
        header: "flex items-center gap-3 mb-4",
        spinner: "w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin",
        title: "text-sm font-medium text-blue-900 dark:text-blue-100",
        message: "text-sm text-blue-800 dark:text-blue-200",
        barContainer: "mb-4",
        barHeader: "flex justify-between text-xs text-blue-700 dark:text-blue-300 mb-2",
        barBg: "w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2",
        barFill: "bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300",
        listContainer: "space-y-2",
        listTitle: "text-xs font-medium text-blue-900 dark:text-blue-100 mb-2",
        list: "max-h-32 overflow-y-auto space-y-1",
        listItem: "flex items-center gap-2 text-xs",
        listItemIconProgress: "w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0",
        listItemIconDone: "w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0",
        listItemText: "text-blue-800 dark:text-blue-200 truncate",
    },

    error: {
        container: "flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg",
        icon: "w-5 h-5",
        text: "text-sm",
    },

    button: {
        create: "w-full px-6 sm:px-8 py-3 sm:py-4 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base",
    },

    success: {
        container: "bg-green-50 dark:bg-green-900/20 rounded-lg p-4 sm:p-6 text-center",
        iconContainer: "w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4",
        icon: "w-6 h-6 text-green-600 dark:text-green-400",
        title: "text-lg font-medium text-green-900 dark:text-green-100 mb-2",
        message: "text-green-800 dark:text-green-200 mb-6",
        actions: "flex justify-center gap-4",
        primaryButton: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors",
        secondaryButton: "px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
    }
};

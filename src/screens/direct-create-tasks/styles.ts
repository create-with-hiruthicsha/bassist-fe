export const styles = {
    container: "min-h-screen bg-white dark:bg-gray-900",
    header: "border-b border-gray-100 dark:border-gray-800",
    headerContent: "max-w-6xl mx-auto px-4 sm:px-6 py-6",
    backButton: "flex items-center gap-2 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
    backIcon: "w-5 h-5",
    backText: "text-base font-medium",

    main: "max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12",

    titleSection: "mb-8",
    title: "text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2",
    subtitle: "text-sm sm:text-base text-gray-600 dark:text-gray-400",

    card: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8",

    section: {
        marginBottom: "mb-8",
        title: "text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2",
        subTitle: "text-gray-600 dark:text-gray-400 mb-4",
        h3: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-4",
        label: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
        labelDark: "block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2",
        fileUploadContainer: "mb-6",
    },

    platformGrid: "grid grid-cols-2 sm:grid-cols-3 gap-3",
    platformButton: {
        base: "p-3 rounded-lg border text-left transition-all flex flex-col items-start gap-1 w-full",
        active: "border-blue-700 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm",
        connected: "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
        disabled: "border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed grayscale",
        content: "font-medium flex items-center justify-between w-full",
        needsSetup: "text-[10px] uppercase font-bold tracking-tighter opacity-70",
        description: "text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1",
    },

    input: {
        text: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700",
        textarea: "w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700",
    },

    tip: {
        container: "mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg",
        text: "text-sm text-blue-800 dark:text-blue-200",
        button: "mt-2 text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 underline",
    },

    divider: {
        container: "flex items-center gap-4 mb-4",
        line: "flex-1 h-px bg-gray-300 dark:bg-gray-600",
        text: "text-sm text-gray-500 dark:text-gray-400 font-medium",
    },

    checkbox: {
        container: "flex items-center gap-3",
        input: "w-4 h-4 text-blue-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-700 dark:focus:ring-blue-400",
        label: "text-sm text-gray-700 dark:text-gray-300",
    },

    status: {
        error: "mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg",
        errorHeader: "flex items-center gap-2",
        errorIcon: "w-5 h-5 text-red-500 dark:text-red-400",
        errorTitle: "text-red-700 dark:text-red-300 font-medium",
        errorMessage: "text-red-600 dark:text-red-400 mt-1",

        progress: "mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg",
        progressHeader: "flex items-center gap-2 mb-2",
        progressIcon: "w-5 h-5 text-blue-500 dark:text-blue-400 animate-spin",
        progressTitle: "text-blue-700 dark:text-blue-300 font-medium",
        progressMessage: "text-sm text-blue-600 dark:text-blue-400",
    },

    actions: {
        container: "flex gap-4",
        cancel: "px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
        submit: "px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
        spinner: "w-4 h-4 animate-spin",
    }
};

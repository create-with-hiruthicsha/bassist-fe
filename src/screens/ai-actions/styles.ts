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

    platformSection: "mb-6",

    inputSection: "mb-6",
    label: "block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2",
    textarea: "w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700",

    error: {
        container: "mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg",
        content: "flex items-center gap-2",
        icon: "w-5 h-5 text-red-500 dark:text-red-400",
        text: "text-red-700 dark:text-red-300 font-medium",
        message: "text-red-600 dark:text-red-400 mt-1",
    },

    loading: {
        container: "mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg",
        header: "flex items-center gap-2",
        icon: "w-5 h-5 text-blue-500 dark:text-blue-400 animate-spin",
        textWrapper: "flex-1",
        title: "text-blue-700 dark:text-blue-300 font-medium",
        message: "text-sm text-blue-600 dark:text-blue-400 mt-1",
    },

    result: {
        container: "mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg",
        header: "flex items-center gap-2 mb-2",
        icon: "w-5 h-5 text-green-500 dark:text-green-400",
        title: "text-green-700 dark:text-green-300 font-medium",
        content: "w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4 markdown-content",
    },

    actions: {
        container: "flex gap-4",
        cancel: "px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
        submit: "px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
        spinner: "w-4 h-4 animate-spin",
    }
};

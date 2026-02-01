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

    contentSpace: "space-y-8",

    card: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6",

    section: {
        title: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-2",
        description: "text-xs text-gray-600 dark:text-gray-400 mb-4",
        label: "block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3",
        grid: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6",
        divider: "border-t border-gray-200 dark:border-gray-700 pt-6",
    },

    textarea: "w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700",

    fileUpload: {
        area: "h-64 flex flex-col justify-center",
    },

    options: {
        container: "mb-4",
        label: "flex items-center gap-3 cursor-pointer",
        checkbox: "w-5 h-5 text-blue-700 border-gray-300 rounded focus:ring-blue-700",
        text: "text-sm text-gray-900 dark:text-gray-100",
    },

    formatSelect: {
        container: "mb-6",
        label: "block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3",
        group: "flex gap-2",
        button: {
            active: "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2",
            inactive: "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600",
        }
    },

    error: {
        container: "flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg mb-4",
        icon: "w-5 h-5",
        text: "text-sm",
    },

    generateButton: "w-full px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
    buttonIcon: "w-5 h-5",

    preview: {
        container: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6",
        header: "flex items-center justify-between mb-6",
        titleWrapper: "flex items-center gap-2",
        titleIcon: "w-5 h-5 text-blue-700",
        title: "text-lg font-medium text-gray-900 dark:text-gray-100",
        actions: "flex items-center gap-4",
        formatBadge: "text-sm text-gray-500 dark:text-gray-400 uppercase",
        downloadButton: "px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 flex items-center gap-2",
        downloadIcon: "w-4 h-4",

        empty: {
            container: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 flex items-center justify-center",
            content: "text-center",
            icon: "w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4",
            title: "text-lg font-medium text-gray-900 dark:text-gray-100 mb-2",
            text: "text-sm text-gray-500 dark:text-gray-400",
        },

        progress: {
            container: "mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg",
            content: "flex items-center gap-2",
            spinner: "animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-400",
            text: "text-sm text-blue-700 dark:text-blue-300",
        },

        content: {
            wrapper: "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden",
            docxWrapper: "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden min-h-[600px] bg-white dark:bg-gray-900",
            noContent: "flex items-center justify-center h-full min-h-[600px]",

            splitLayout: "grid grid-cols-1 lg:grid-cols-2 min-h-[600px]",
            columnLeft: "border-r border-gray-200 dark:border-gray-700",
            headerBar: "bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700",
            headerTitle: "text-sm font-medium text-gray-700 dark:text-gray-300",
            editor: "w-full h-[600px] p-4 font-mono text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 resize-none focus:outline-none",
            markdownPreview: "p-6 markdown-content h-[600px] overflow-y-auto bg-white dark:bg-gray-900",
            rawPre: "p-6 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono min-h-[600px] overflow-y-auto bg-white dark:bg-gray-900",
        }
    }
};

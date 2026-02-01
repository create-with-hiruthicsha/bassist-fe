export const styles = {
    container: "min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden",
    header: "border-b border-gray-100 dark:border-gray-800",
    headerContent: "max-w-4xl mx-auto px-4 sm:px-6 py-6",
    backButton: "flex items-center gap-2 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
    backIcon: "w-5 h-5",
    backText: "text-base font-medium",

    main: "max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full",

    section: {
        container: "bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6",
        title: "block text-sm font-medium text-gray-900 dark:text-gray-100 mb-4",
        platformHeader: "flex items-center justify-between mb-4",
        manageButton: "text-xs text-blue-700 dark:text-blue-400 font-medium hover:underline flex items-center gap-1",
        manageIcon: "w-3 h-3",
    },

    input: {
        textarea: "w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700",
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
        list: "max-h-32 overflow-y-hidden space-y-1",
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
        primary: "w-full px-6 sm:px-8 py-3 sm:py-4 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base",
        create: "w-full px-6 sm:px-8 py-3 sm:py-4 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed",
    },

    results: {
        container: "mt-8",
        header: "flex items-center justify-between mb-6",
        title: "text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100",
        meta: "flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400",
        summaryCard: "bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6",
        summaryTitle: "text-sm font-medium text-blue-900 dark:text-blue-100 mb-2",
        summaryGrid: "grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm",
        summaryValue: "text-blue-700 dark:text-blue-300 font-medium",
        summaryLabel: "text-blue-600 dark:text-blue-400 ml-1",
        assumptionsCard: "bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6",
        assumptionsTitle: "text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2",
        assumptionsList: "text-sm text-yellow-800 dark:text-yellow-200 space-y-1",
        assumptionsItem: "flex items-start gap-2",
        assumptionsBullet: "text-yellow-600 dark:text-yellow-400 mt-1",
    },

    taskList: {
        container: "space-y-6 mb-8 min-w-0",
        epicContainer: "min-w-0",
        epicHeader: "flex items-center gap-2 mb-3",
        epicIcon: "w-5 h-5 text-blue-700 dark:text-blue-400",
        epicTitle: "text-lg font-semibold text-gray-900 dark:text-gray-100 break-words",
        tasksContainer: "space-y-2 ml-7 min-w-0",
        taskCard: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors min-w-0",
    },

    editForm: {
        container: "space-y-3 min-w-0",
        label: "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1",
        input: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700",
        textarea: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700",
        row: "flex gap-2 min-w-0",
        select: "px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
        actions: "flex items-center gap-2 pt-2",
        saveButton: "flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors",
        cancelButton: "flex items-center gap-1 px-3 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 transition-colors",
        icon: "w-3 h-3",
    },

    viewMode: {
        container: "flex items-start justify-between gap-4 min-w-0",
        content: "flex-1 min-w-0",
        title: "font-medium text-gray-900 dark:text-gray-100 mb-1 break-words",
        description: "text-sm text-gray-600 dark:text-gray-400 mb-2 break-words",
        metaContainer: "flex items-center gap-2 flex-shrink-0",
        estimateBadge: "flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded",
        clockIcon: "w-3 h-3",
        editButton: "p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors",
        editIcon: "w-4 h-4",
    }
};

export const styles = {
    container: "min-h-screen bg-white dark:bg-gray-900",
    header: "border-b border-gray-100 dark:border-gray-800",
    headerContent: "max-w-4xl mx-auto px-4 sm:px-6 py-6",
    headerInner: "flex items-center gap-4",
    backButton: "flex items-center gap-2 text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
    backIcon: "w-5 h-5",
    backText: "text-base font-medium",
    titleContainer: "flex items-center gap-3",
    titleIcon: "w-6 h-6 text-blue-700 dark:text-blue-400",
    mainTitle: "text-2xl font-semibold text-gray-900 dark:text-gray-100",

    main: "max-w-4xl mx-auto px-4 sm:px-6 py-8",
    contentSpace: "space-y-8",

    card: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6",
    sectionHeader: "mb-6",
    sectionTitle: "text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2",
    sectionDescription: "text-gray-600 dark:text-gray-400",

    themeList: "space-y-3",
    themeButton: {
        base: "w-full flex items-center gap-4 p-4 rounded-lg border transition-all duration-200",
        active: "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20",
        inactive: "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50",

        iconContainer: "flex items-center justify-center w-10 h-10 rounded-lg",
        iconContainerActive: "bg-blue-100 dark:bg-blue-800",
        iconContainerInactive: "bg-gray-100 dark:bg-gray-700",

        icon: "w-5 h-5",
        iconActive: "text-blue-600 dark:text-blue-400",
        iconInactive: "text-gray-600 dark:text-gray-400",

        textContainer: "flex-1 text-left",
        labelRow: "flex items-center gap-2",
        label: "font-medium",
        labelActive: "text-blue-900 dark:text-blue-100",
        labelInactive: "text-gray-900 dark:text-gray-100",

        dot: "w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full",

        desc: "text-sm mt-1",
        descActive: "text-blue-700 dark:text-blue-300",
        descInactive: "text-gray-600 dark:text-gray-400"
    },

    org: {
        container: "space-y-4",
        inner: "p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700",
        header: "flex items-center justify-between mb-4",
        title: "text-sm font-medium text-gray-900 dark:text-gray-100 italic",
        subtitle: "text-xs text-gray-500 dark:text-gray-400 mt-1",

        refreshButton: "p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all",
        spinner: "w-4 h-4 animate-spin",
        icon: "w-4 h-4",

        codeRow: "flex items-center gap-2",
        codeDisplay: "flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl font-mono text-sm text-gray-900 dark:text-gray-100 break-all",
        loadingSkeleton: "h-5 w-32 bg-gray-100 dark:bg-gray-700 animate-pulse rounded",

        copyButton: {
            base: "p-3 rounded-xl border transition-all flex items-center gap-2",
            active: "bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
            inactive: "bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:text-blue-400",
            icon: "w-5 h-5",
            text: "text-sm font-medium hidden sm:inline",
        }
    },

    integration: {
        container: "bg-gray-50 dark:bg-gray-700 rounded-lg p-6",
        layout: "flex items-center justify-between",
        info: "flex items-center gap-4",
        iconBox: "flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-full",
        icon: "w-6 h-6 text-gray-700 dark:text-gray-300",
        textContainer: "",
        title: "text-lg font-semibold text-gray-900 dark:text-gray-100",
        desc: "text-gray-600 dark:text-gray-400",
    }
};

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 border-t-2 border-t-sky-600/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-300 dark:text-gray-400">
            &copy; {currentYear} Quizling. All rights reserved.
          </div>

          <div className="flex space-x-8">
            <a
              href="https://github.com/awead/quizling"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 dark:text-gray-400 hover:text-sky-400 dark:hover:text-sky-300 transition-all duration-300 hover:scale-110 font-medium"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-sm text-gray-300 dark:text-gray-400 hover:text-sky-400 dark:hover:text-sky-300 transition-all duration-300 hover:scale-110 font-medium"
            >
              About
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

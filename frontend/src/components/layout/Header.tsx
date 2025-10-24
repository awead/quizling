import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center group">
            <h1 className="text-2xl font-bold text-gradient transition-transform duration-300 group-hover:scale-105">
              Quizling
            </h1>
          </Link>

          <nav className="flex items-center space-x-8">
            <Link
              to="/"
              className="relative text-gray-700 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-sky-600 after:to-purple-600 after:transition-all after:duration-300 hover:after:w-full"
            >
              Home
            </Link>
            <Link
              to="/questions"
              className="relative text-gray-700 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-sky-600 after:to-purple-600 after:transition-all after:duration-300 hover:after:w-full"
            >
              Browse Questions
            </Link>
            <Link
              to="/quiz"
              className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white rounded-lg font-medium shadow-soft hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Take Quiz
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

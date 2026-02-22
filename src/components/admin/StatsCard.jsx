import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/Card';

export default function StatsCard({ title, value, icon: Icon, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full transition-shadow duration-200 hover:shadow-md dark:hover:shadow-gray-900/40">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              {description && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
              )}
            </div>
            {Icon && (
              <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-2.5">
                <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

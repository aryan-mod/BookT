import { motion } from 'framer-motion';
import { BookCheck } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export default function AdminBooks() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Approved Books
      </h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <BookCheck className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Coming soon</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

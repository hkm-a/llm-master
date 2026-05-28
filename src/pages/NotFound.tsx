import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-bold text-gray-200 dark:text-gray-700 mb-4 select-none">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          页面未找到
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          你访问的页面不存在或已被移除。请检查链接是否正确。
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/">
            <Button variant="primary">
              <Home className="w-4 h-4 mr-1" />
              返回首页
            </Button>
          </Link>
          <Link to="/resources">
            <Button variant="secondary">
              <Search className="w-4 h-4 mr-1" />
              浏览资源
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

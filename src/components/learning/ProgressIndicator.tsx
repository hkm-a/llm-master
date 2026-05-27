import { useProgressPercent, useCompletedCount, useInProgressCount, useTotalCount } from "@/stores/progressStore";

export function ProgressIndicator() {
  const totalProgress = useProgressPercent();
  const completedCount = useCompletedCount();
  const inProgressCount = useInProgressCount();
  const totalCount = useTotalCount();

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">学习进度</h3>
        <span className="text-lg font-bold text-blue-600">
          {totalProgress}%
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${totalProgress}%` }} 
        />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {completedCount}
          </div>
          <div className="text-xs text-gray-500">已完成</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {inProgressCount}
          </div>
          <div className="text-xs text-gray-500">进行中</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          <div className="text-xs text-gray-500">总课程</div>
        </div>
      </div>
    </div>
  );
}

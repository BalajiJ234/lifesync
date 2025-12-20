"use client";

import { BudgetBucket, BucketStatus } from "@/store/slices/budgetSlice";

interface BudgetBucketCardProps {
  bucket: BudgetBucket;
  onClick: () => void;
}

const bucketConfig = {
  NEEDS: {
    title: "Needs",
    subtitle: "50% - Essentials",
    icon: "🏠",
    color: "blue",
    bgGradient: "from-blue-500 to-blue-600",
  },
  WANTS: {
    title: "Wants",
    subtitle: "30% - Lifestyle",
    icon: "🎯",
    color: "purple",
    bgGradient: "from-purple-500 to-purple-600",
  },
  SAVINGS: {
    title: "Savings",
    subtitle: "15% - Future",
    icon: "💰",
    color: "green",
    bgGradient: "from-green-500 to-green-600",
  },
  DEBT: {
    title: "Debt",
    subtitle: "5% - Payments",
    icon: "📊",
    color: "orange",
    bgGradient: "from-orange-500 to-orange-600",
  },
};

const statusColors: Record<
  BucketStatus,
  { bg: string; text: string; border: string }
> = {
  UNDER: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
  },
  NEAR_LIMIT: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  OVER: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
};

export default function BudgetBucketCard({
  bucket,
  onClick,
}: BudgetBucketCardProps) {
  const config = bucketConfig[bucket.type];
  const statusColor = statusColors[bucket.status];

  const percentUsed =
    bucket.planned.amount > 0
      ? (bucket.spent.amount / bucket.planned.amount) * 100
      : 0;

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${statusColor.border} p-5 cursor-pointer hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.bgGradient} flex items-center justify-center text-xl`}>
            {config.icon}
          </div>
          <div>
            <h3 className='font-semibold text-gray-900 dark:text-white'>
              {config.title}
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {config.subtitle}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
          {bucket.status === "UNDER"
            ? "On Track"
            : bucket.status === "NEAR_LIMIT"
            ? "Near Limit"
            : "Over Budget"}
        </span>
      </div>

      {/* Progress Bar */}
      <div className='mb-4'>
        <div className='flex justify-between text-sm mb-1'>
          <span className='text-gray-600 dark:text-gray-400'>Spent</span>
          <span className='font-medium text-gray-900 dark:text-white'>
            {Math.min(percentUsed, 100).toFixed(0)}%
          </span>
        </div>
        <div className='h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
          <div
            className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${config.bgGradient}`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Amounts */}
      <div className='space-y-2 text-sm'>
        <div className='flex justify-between'>
          <span className='text-gray-500 dark:text-gray-400'>Budget</span>
          <span className='font-medium text-gray-900 dark:text-white'>
            {formatCurrency(bucket.planned.amount, bucket.planned.currency)}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-500 dark:text-gray-400'>Spent</span>
          <span
            className={`font-medium ${
              bucket.status === "OVER"
                ? "text-red-600 dark:text-red-400"
                : "text-gray-900 dark:text-white"
            }`}>
            {formatCurrency(bucket.spent.amount, bucket.spent.currency)}
          </span>
        </div>
        <div className='flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700'>
          <span className='text-gray-500 dark:text-gray-400'>Remaining</span>
          <span
            className={`font-bold ${
              bucket.remaining.amount < 0
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }`}>
            {formatCurrency(bucket.remaining.amount, bucket.remaining.currency)}
          </span>
        </div>
      </div>

      {/* Categories Preview */}
      {Object.keys(bucket.categories).length > 0 && (
        <div className='mt-4 pt-4 border-t border-gray-100 dark:border-gray-700'>
          <p className='text-xs text-gray-500 dark:text-gray-400 mb-2'>
            Top Categories
          </p>
          <div className='space-y-1'>
            {Object.entries(bucket.categories)
              .slice(0, 3)
              .map(([name, cat]) => (
                <div key={name} className='flex justify-between text-xs'>
                  <span className='text-gray-600 dark:text-gray-400 truncate'>
                    {name}
                  </span>
                  <span className='text-gray-900 dark:text-white font-medium'>
                    {cat.spent.toFixed(0)} / {cat.planned.toFixed(0)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

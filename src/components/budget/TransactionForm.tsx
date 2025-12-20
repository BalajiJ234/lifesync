"use client";

import { useState } from "react";
import { BucketType, MonthlyBudgetPlan } from "@/store/slices/budgetSlice";

interface TransactionFormProps {
  bucket: BucketType;
  plan: MonthlyBudgetPlan | null;
  onSubmit: (transaction: {
    bucket: BucketType;
    category: string;
    amount: number;
    currency: string;
    description?: string;
  }) => void;
  onClose: () => void;
  isLoading: boolean;
}

const defaultCategories: Record<BucketType, string[]> = {
  NEEDS: [
    "Housing",
    "Utilities",
    "Groceries",
    "Transportation",
    "Insurance",
    "Healthcare",
    "Minimum Debt Payments",
  ],
  WANTS: [
    "Dining Out",
    "Entertainment",
    "Shopping",
    "Subscriptions",
    "Travel",
    "Hobbies",
    "Personal Care",
  ],
  SAVINGS: [
    "Emergency Fund",
    "Investments",
    "Retirement",
    "Home Down Payment",
    "Vacation Fund",
  ],
  DEBT: [
    "Credit Card",
    "Student Loan",
    "Car Loan",
    "Personal Loan",
    "Mortgage Extra",
  ],
};

const bucketLabels: Record<BucketType, { title: string; color: string }> = {
  NEEDS: { title: "Needs (50%)", color: "blue" },
  WANTS: { title: "Wants (30%)", color: "purple" },
  SAVINGS: { title: "Savings (15%)", color: "green" },
  DEBT: { title: "Debt Payments (5%)", color: "orange" },
};

export default function TransactionForm({
  bucket,
  plan,
  onSubmit,
  onClose,
  isLoading,
}: TransactionFormProps) {
  const [selectedBucket, setSelectedBucket] = useState<BucketType>(bucket);
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(plan?.baseCurrency || "USD");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory = category === "custom" ? customCategory : category;
    if (!finalCategory || !amount) return;

    onSubmit({
      bucket: selectedBucket,
      category: finalCategory,
      amount: parseFloat(amount),
      currency,
      description: description || undefined,
    });
  };

  const categories = defaultCategories[selectedBucket];

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
        {/* Backdrop */}
        <div
          className='fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 transition-opacity'
          onClick={onClose}
        />

        {/* Modal */}
        <div className='relative transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className='border-b border-gray-200 dark:border-gray-700 px-6 py-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Log Transaction
                </h3>
                <button
                  type='button'
                  onClick={onClose}
                  className='text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'>
                  <svg
                    className='h-6 w-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className='px-6 py-4 space-y-4'>
              {/* Bucket Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Budget Category
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  {(Object.keys(bucketLabels) as BucketType[]).map((b) => (
                    <button
                      key={b}
                      type='button'
                      onClick={() => {
                        setSelectedBucket(b);
                        setCategory("");
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedBucket === b
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}>
                      {bucketLabels[b].title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Subcategory
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  required>
                  <option value=''>Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value='custom'>+ Custom Category</option>
                </select>
              </div>

              {/* Custom Category Input */}
              {category === "custom" && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Custom Category Name
                  </label>
                  <input
                    type='text'
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder='Enter category name'
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  />
                </div>
              )}

              {/* Amount and Currency */}
              <div className='grid grid-cols-3 gap-3'>
                <div className='col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Amount
                  </label>
                  <input
                    type='number'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='0.00'
                    step='0.01'
                    min='0'
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'>
                    <option value='USD'>USD</option>
                    <option value='EUR'>EUR</option>
                    <option value='GBP'>GBP</option>
                    <option value='JPY'>JPY</option>
                    <option value='INR'>INR</option>
                    <option value='AED'>AED</option>
                    <option value='SGD'>SGD</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Description (optional)
                </label>
                <input
                  type='text'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='e.g., Monthly rent payment'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
              </div>

              {/* Remaining Budget Info */}
              {plan && (
                <div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Remaining in{" "}
                      {bucketLabels[selectedBucket].title.split(" ")[0]}
                    </span>
                    <span
                      className={`font-medium ${
                        plan.buckets[selectedBucket].remaining.amount < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}>
                      {plan.baseCurrency}{" "}
                      {plan.buckets[
                        selectedBucket
                      ].remaining.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'>
                Cancel
              </button>
              <button
                type='submit'
                disabled={isLoading || !category || !amount}
                className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
                {isLoading ? (
                  <span className='flex items-center'>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4'
                      fill='none'
                      viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                      />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Log Transaction"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

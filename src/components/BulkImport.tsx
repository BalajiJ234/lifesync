'use client'

import { useState } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'

interface BulkImportProps {
  feature: 'expenses' | 'todos' | 'notes' | 'friends' | 'income'
  onImport: (data: unknown[]) => void
  onClose: () => void
}

const templates = {
  expenses: {
    headers: ['amount', 'description', 'category', 'date', 'currency'],
    sample: [
      { amount: 25.50, description: 'Lunch at restaurant', category: 'Food', date: '2025-01-10', currency: 'USD' },
      { amount: 1200, description: 'Monthly rent', category: 'Housing', date: '2025-01-01', currency: 'USD' },
      { amount: 45, description: 'Gas station', category: 'Transportation', date: '2025-01-09', currency: 'USD' }
    ]
  },
  income: {
    headers: ['source', 'amount', 'category', 'date', 'status', 'recurrence', 'notes'],
    sample: [
      { source: 'Monthly Salary', amount: 5000, category: 'salary', date: '2025-01-01', status: 'received', recurrence: 'monthly', notes: 'Regular paycheck' },
      { source: 'Freelance Project', amount: 1500, category: 'freelance', date: '2025-01-15', status: 'scheduled', recurrence: 'one-time', notes: 'Web design project' },
      { source: 'Stock Dividend', amount: 250, category: 'investment', date: '2025-01-20', status: 'scheduled', recurrence: 'quarterly', notes: 'Tech stocks portfolio' }
    ]
  },
  todos: {
    headers: ['text', 'priority', 'category', 'dueDate'],
    sample: [
      { text: 'Complete project proposal', priority: 'high', category: 'Work', dueDate: '2025-01-15' },
      { text: 'Buy groceries', priority: 'medium', category: 'Personal', dueDate: '2025-01-12' },
      { text: 'Schedule dentist appointment', priority: 'low', category: 'Health', dueDate: '2025-01-20' }
    ]
  },
  notes: {
    headers: ['title', 'content', 'category'],
    sample: [
      { title: 'Meeting Notes', content: 'Discussed project timeline and deliverables', category: 'Work' },
      { title: 'Recipe Ideas', content: 'Try the new pasta recipe with mushrooms', category: 'Personal' },
      { title: 'Book Recommendations', content: 'The Design of Everyday Things by Don Norman', category: 'Learning' }
    ]
  },
  friends: {
    headers: ['name', 'email', 'phone'],
    sample: [
      { name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
      { name: 'Jane Smith', email: 'jane@example.com', phone: '+1987654321' },
      { name: 'Mike Johnson', email: 'mike@example.com', phone: '+1122334455' }
    ]
  }
}

export default function BulkImport({ feature, onImport, onClose }: BulkImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)

  const template = templates[feature]

  const downloadTemplate = () => {
    const csvContent = [
      template.headers.join(','),
      ...template.sample.map(row => 
        template.headers.map(header => {
          const value = (row as Record<string, string>)[header]
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${feature}_template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    const data = lines.slice(1).map(line => {
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/"/g, ''))
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim().replace(/"/g, ''))
      
      const obj: Record<string, string> = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ''
      })
      return obj
    })
    
    return data.filter(row => Object.values(row).some(val => val !== ''))
  }

  const validateData = (data: Record<string, string>[]): { valid: unknown[]; errors: string[] } => {
    const valid: unknown[] = []
    const errors: string[] = []

    data.forEach((row, index) => {
      const rowNum = index + 2 // +2 because we skip header and arrays are 0-indexed
      
      try {
        switch (feature) {
          case 'expenses':
            if (!row.amount || isNaN(parseFloat(row.amount))) {
              errors.push(`Row ${rowNum}: Invalid amount "${row.amount}"`)
              return
            }
            if (!row.description?.trim()) {
              errors.push(`Row ${rowNum}: Description is required`)
              return
            }
            valid.push({
              id: Date.now().toString() + Math.random(),
              amount: parseFloat(row.amount),
              description: row.description.trim(),
              category: row.category || 'Other',
              date: row.date || new Date().toISOString().split('T')[0],
              currency: row.currency || 'USD',
              createdAt: new Date()
            })
            break

          case 'income':
            if (!row.amount || isNaN(parseFloat(row.amount))) {
              errors.push(`Row ${rowNum}: Invalid amount "${row.amount}"`)
              return
            }
            if (!row.source?.trim()) {
              errors.push(`Row ${rowNum}: Source is required`)
              return
            }
            const validCategories = ['salary', 'freelance', 'investment', 'refund', 'rental', 'gift', 'other']
            const validRecurrences = ['one-time', 'daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly']
            const validStatuses = ['received', 'scheduled']
            
            valid.push({
              id: Date.now().toString() + Math.random(),
              source: row.source.trim(),
              amount: parseFloat(row.amount),
              category: validCategories.includes(row.category?.toLowerCase()) ? row.category.toLowerCase() : 'other',
              date: row.date || new Date().toISOString().split('T')[0],
              status: validStatuses.includes(row.status?.toLowerCase()) ? row.status.toLowerCase() : 'received',
              recurrence: validRecurrences.includes(row.recurrence?.toLowerCase()) ? row.recurrence.toLowerCase() : 'one-time',
              notes: row.notes || '',
              createdAt: new Date()
            })
            break

          case 'todos':
            if (!row.text?.trim()) {
              errors.push(`Row ${rowNum}: Task text is required`)
              return
            }
            valid.push({
              id: Date.now().toString() + Math.random(),
              text: row.text.trim(),
              completed: false,
              priority: ['low', 'medium', 'high'].includes(row.priority) ? row.priority : 'medium',
              category: row.category || 'Personal',
              dueDate: row.dueDate || undefined,
              createdAt: new Date()
            })
            break

          case 'notes':
            if (!row.title?.trim()) {
              errors.push(`Row ${rowNum}: Title is required`)
              return
            }
            valid.push({
              id: Date.now().toString() + Math.random(),
              title: row.title.trim(),
              content: row.content || '',
              category: row.category || 'General',
              createdAt: new Date(),
              updatedAt: new Date()
            })
            break

          case 'friends':
            if (!row.name?.trim()) {
              errors.push(`Row ${rowNum}: Name is required`)
              return
            }
            valid.push({
              id: Date.now().toString() + Math.random(),
              name: row.name.trim(),
              email: row.email || '',
              phone: row.phone || '',
              avatar: Math.floor(Math.random() * 40) + 1,
              isCustomAvatar: false,
              createdAt: new Date()
            })
            break
        }
      } catch {
        errors.push(`Row ${rowNum}: Invalid data format`)
      }
    })

    return { valid, errors }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setResult(null)

    try {
      const text = await file.text()
      const parsedData = parseCSV(text)
      
      if (parsedData.length === 0) {
        setResult({ success: 0, errors: ['No valid data found in file'] })
        return
      }

      const { valid, errors } = validateData(parsedData)
      
      if (valid.length > 0) {
        onImport(valid)
      }
      
      setResult({ success: valid.length, errors })
    } catch {
      setResult({ success: 0, errors: ['Failed to parse file. Please check the format.'] })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Bulk Import {feature.charAt(0).toUpperCase() + feature.slice(1)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Download Template */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">
              Download the template to see the required format
            </p>
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              <span>Download Template</span>
            </button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">
              Upload your CSV file
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>Choose File</span>
            </label>
            {file && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Import Data</span>
              </>
            )}
          </button>

          {/* Results */}
          {result && (
            <div className="space-y-2">
              {result.success > 0 && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle size={16} />
                  <span className="text-sm">
                    Successfully imported {result.success} {result.success === 1 ? 'item' : 'items'}
                  </span>
                </div>
              )}
              
              {result.errors.length > 0 && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-600 mb-2">
                    <AlertCircle size={16} />
                    <span className="text-sm font-medium">
                      {result.errors.length} error{result.errors.length === 1 ? '' : 's'} found:
                    </span>
                  </div>
                  <div className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
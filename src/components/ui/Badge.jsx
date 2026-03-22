const variants = {
  student: 'bg-blue-50 text-blue-600 border-blue-100',
  instructor: 'bg-purple-50 text-purple-600 border-purple-100',
  admin: 'bg-red-50 text-red-600 border-red-100',
  class: 'bg-blue-50 text-blue-600 border-blue-100',
  project: 'bg-green-50 text-green-600 border-green-100',
  study: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  general: 'bg-gray-50 text-gray-600 border-gray-100',
  open: 'bg-green-50 text-green-600 border-green-100',
  closed: 'bg-red-50 text-red-600 border-red-100',
  easy: 'bg-green-50 text-green-600 border-green-100',
  medium: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  hard: 'bg-red-50 text-red-600 border-red-100',
  text: 'bg-gray-50 text-gray-600 border-gray-100',
  resource: 'bg-blue-50 text-blue-600 border-blue-100',
  announcement: 'bg-orange-50 text-orange-600 border-orange-100',
}

export function Badge({ label, variant }) {
  const style = variants[variant] || variants[label?.toLowerCase()] || 'bg-gray-50 text-gray-600 border-gray-100'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${style}`}>
      {label}
    </span>
  )
}

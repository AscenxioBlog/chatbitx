export function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' }
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
  return src
    ? <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover border border-border ${className}`} />
    : <div className={`${sizes[size]} rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center border border-border ${className}`}>{initials}</div>
}

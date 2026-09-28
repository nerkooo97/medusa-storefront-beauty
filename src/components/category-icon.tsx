import React from "react"
import * as LucideIcons from "lucide-react"

interface CategoryIconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  name?: string | null
  className?: string
  fallback?: React.ComponentType<{ className?: string }>
}

export function CategoryIcon({
  name,
  className = "size-4",
  fallback: FallbackIcon,
  ...props
}: CategoryIconProps) {
  if (!name) {
    return FallbackIcon ? <FallbackIcon className={className} /> : null
  }

  // Exact match from Lucide icons (exact PascalCase string e.g. "Sparkles", "Heart")
  const Component = (LucideIcons as Record<string, unknown>)[name]

  if (!Component || (typeof Component !== "function" && typeof Component !== "object")) {
    return FallbackIcon ? <FallbackIcon className={className} /> : null
  }

  const Icon = Component as React.ComponentType<{ className?: string }>
  return <Icon className={className} {...props} />
}

export default CategoryIcon

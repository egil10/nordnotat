"use client"

import { Badge } from "@/components/ui/badge"
import { BookOpen } from "lucide-react"

interface CourseBadgeProps {
  courseCode: string
  className?: string
}

export function CourseBadge({ courseCode, className }: CourseBadgeProps) {
  return (
    <Badge variant="secondary" className={className}>
      <BookOpen className="w-3 h-3 mr-1" />
      {courseCode}
    </Badge>
  )
}


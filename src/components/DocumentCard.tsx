"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { Document } from "@/types"
import { Star, BookOpen } from "lucide-react"

interface DocumentCardProps {
  document: Document
}

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Link href={`/marketplace/${document.id}`}>
      <Card className="h-full transition-all hover:shadow-lg cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-2">{document.title}</CardTitle>
            <Badge variant="outline" className="ml-2 shrink-0">
              {formatPrice(document.price)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {document.summary || document.description || "No description available."}
          </p>
          <div className="flex flex-wrap gap-2">
            {document.course_code && (
              <Badge variant="secondary">
                <BookOpen className="w-3 h-3 mr-1" />
                {document.course_code}
              </Badge>
            )}
            {document.difficulty && (
              <Badge variant="outline">
                <Star className="w-3 h-3 mr-1" />
                {document.difficulty}/5
              </Badge>
            )}
            {document.university && (
              <Badge variant="outline">{document.university}</Badge>
            )}
          </div>
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {document.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          {new Date(document.created_at).toLocaleDateString("no-NO")}
        </CardFooter>
      </Card>
    </Link>
  )
}


"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Upload } from "lucide-react"

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  course_code: z.string().optional(),
  university: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  file: z.instanceof(File).refine((file) => file.type === "application/pdf", "Only PDF files are allowed"),
})

type UploadFormData = z.infer<typeof uploadSchema>

export function UploadForm() {
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  })

  const file = watch("file")

  const onSubmit = async (data: UploadFormData) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", data.file)
      formData.append("title", data.title)
      formData.append("description", data.description || "")
      formData.append("course_code", data.course_code || "")
      formData.append("university", data.university || "")
      formData.append("price", data.price.toString())

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully!",
      })

      router.push("/dashboard/uploads")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>Upload a PDF document to the marketplace</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g., Statistics 101 Lecture Notes"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Brief description of the document"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course_code">Course Code</Label>
              <Input
                id="course_code"
                {...register("course_code")}
                placeholder="e.g., STK1110"
              />
            </div>

            <div>
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                {...register("university")}
                placeholder="e.g., University of Oslo"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="price">Price (NOK) *</Label>
            <Input
              id="price"
              type="number"
              {...register("price", { 
                valueAsNumber: true,
                setValueAs: (v) => Math.round(parseFloat(v) * 100) // Convert NOK to øre
              })}
              placeholder="0"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter price in NOK (e.g., 99.00 for 99 NOK)
            </p>
            {errors.price && (
              <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="file">PDF File *</Label>
            <Input
              id="file"
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setValue("file", file)
                }
              }}
            />
            {file && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {file.name}
              </p>
            )}
            {errors.file && (
              <p className="text-sm text-destructive mt-1">{errors.file.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isUploading} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


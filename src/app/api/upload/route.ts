import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import {
  extractTextFromPDF,
  generateSummary,
  generateTags,
  detectCourseCodes,
  estimateDifficulty,
  generateFlashcards,
} from "@/lib/ai"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const title = formData.get("title") as string | null
    const description = formData.get("description") as string | null
    const course_code = formData.get("course_code") as string | null
    const university = formData.get("university") as string | null
    const priceStr = formData.get("price") as string | null

    // Validate required fields
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }
    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (!priceStr) {
      return NextResponse.json({ error: "Price is required" }, { status: 400 })
    }

    const price = parseInt(priceStr)
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    // Get user from cookies
    const cookieStore = await cookies()
    const supabaseClient = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // No-op for API routes - cookies are read-only here
          },
          remove(name: string, options: any) {
            // No-op for API routes
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Extract text from PDF
    let text: string
    try {
      text = await extractTextFromPDF(file)
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to extract text from PDF. Please ensure the file is a valid PDF." },
        { status: 400 }
      )
    }

    // Generate AI metadata
    const [summary, tags, courseCodes, difficulty, flashcards] = await Promise.all([
      generateSummary(text),
      generateTags(text),
      detectCourseCodes(text),
      estimateDifficulty(text),
      generateFlashcards(text),
    ])

    // Use detected course code if not provided
    const finalCourseCode = course_code || (courseCodes.length > 0 ? courseCodes[0] : null)

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const filePath = `documents/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file, {
        contentType: "application/pdf",
      })

    if (uploadError) {
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Save document metadata
    const { data: document, error: docError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        course_code: finalCourseCode,
        university: university || null,
        tags: tags,
        price,
        summary,
        difficulty,
        file_path: filePath,
      })
      .select()
      .single()

    if (docError) {
      return NextResponse.json({ error: "Failed to save document" }, { status: 500 })
    }

    // Save flashcards
    if (flashcards.length > 0 && document) {
      await supabase.from("flashcards").insert(
        flashcards.map((fc) => ({
          document_id: document.id,
          front: fc.front,
          back: fc.back,
        }))
      )
    }

    return NextResponse.json({ success: true, documentId: document.id })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}


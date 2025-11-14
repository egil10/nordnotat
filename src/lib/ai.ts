import OpenAI from 'openai'
import pdfParse from 'pdf-parse'

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. AI features will not work.')
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export async function generateSummary(text: string): Promise<string> {
  if (!openai) {
    return 'AI summary generation is not available. Please configure OPENAI_API_KEY.'
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise summaries of academic documents. Summarize the key points in 2-3 sentences.',
        },
        {
          role: 'user',
          content: `Summarize this document:\n\n${text.substring(0, 8000)}`,
        },
      ],
      max_tokens: 200,
    })

    return response.choices[0]?.message?.content || 'Summary generation failed'
  } catch (error) {
    console.error('Error generating summary:', error)
    throw new Error('Failed to generate summary')
  }
}

export async function generateTags(text: string): Promise<string[]> {
  if (!openai) {
    return ['academic', 'notes']
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates relevant tags for academic documents. Return 5-10 tags as a JSON array of strings.',
        },
        {
          role: 'user',
          content: `Generate tags for this document:\n\n${text.substring(0, 8000)}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 200,
    })

    const content = response.choices[0]?.message?.content || '{"tags": []}'
    const parsed = JSON.parse(content)
    return parsed.tags || []
  } catch (error) {
    console.error('Error generating tags:', error)
    return ['academic', 'notes']
  }
}

export async function detectCourseCodes(text: string): Promise<string[]> {
  if (!openai) {
    // Fallback regex pattern for common course code formats
    const regex = /\b[A-Z]{2,4}\d{4,5}\b/g
    const matches = text.match(regex) || []
    return [...new Set(matches)]
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that detects university course codes in text. Course codes are typically 2-4 letters followed by 4-5 numbers (e.g., STK1110, MAT1125). Return a JSON object with a "codes" array.',
        },
        {
          role: 'user',
          content: `Detect course codes in this text:\n\n${text.substring(0, 8000)}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 100,
    })

    const content = response.choices[0]?.message?.content || '{"codes": []}'
    const parsed = JSON.parse(content)
    return parsed.codes || []
  } catch (error) {
    console.error('Error detecting course codes:', error)
    // Fallback regex
    const regex = /\b[A-Z]{2,4}\d{4,5}\b/g
    const matches = text.match(regex) || []
    return [...new Set(matches)]
  }
}

export async function estimateDifficulty(text: string): Promise<number> {
  if (!openai) {
    return 3 // Default medium difficulty
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that estimates the difficulty of academic documents on a scale of 1-5, where 1 is very easy and 5 is very difficult. Return a JSON object with a "difficulty" number.',
        },
        {
          role: 'user',
          content: `Estimate the difficulty of this document:\n\n${text.substring(0, 8000)}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 50,
    })

    const content = response.choices[0]?.message?.content || '{"difficulty": 3}'
    const parsed = JSON.parse(content)
    const difficulty = parsed.difficulty || 3
    return Math.max(1, Math.min(5, Math.round(difficulty)))
  } catch (error) {
    console.error('Error estimating difficulty:', error)
    return 3
  }
}

export async function generateFlashcards(
  text: string
): Promise<{ front: string; back: string }[]> {
  if (!openai) {
    return []
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates study flashcards from academic content. Return a JSON object with a "flashcards" array, where each flashcard has "front" and "back" properties.',
        },
        {
          role: 'user',
          content: `Generate 10-15 flashcards from this document:\n\n${text.substring(0, 8000)}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content || '{"flashcards": []}'
    const parsed = JSON.parse(content)
    return parsed.flashcards || []
  } catch (error) {
    console.error('Error generating flashcards:', error)
    return []
  }
}


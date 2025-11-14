"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GPAChart } from "@/components/GPAChart"
import { createClientComponentClient } from "@/lib/supabase"
import { UserGrade } from "@/types"
import { ArrowLeft } from "lucide-react"

const GRADE_TO_POINTS: Record<string, number> = {
  A: 5.0,
  B: 4.0,
  C: 3.0,
  D: 2.0,
  E: 1.0,
  F: 0.0,
}

export default function AnalyticsPage() {
  const [grades, setGrades] = useState<UserGrade[]>([])
  const [gpa, setGpa] = useState<number | null>(null)
  const [newCourseCode, setNewCourseCode] = useState("")
  const [newGrade, setNewGrade] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadGrades() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("user_grades")
        .select("*")
        .eq("user_id", user.id)

      if (error) {
        console.error("Error loading grades:", error)
      } else {
        setGrades(data || [])
        calculateGPA(data || [])
      }
      setIsLoading(false)
    }

    loadGrades()
  }, [router, supabase])

  const calculateGPA = (gradeList: UserGrade[]) => {
    if (gradeList.length === 0) {
      setGpa(null)
      return
    }

    const totalPoints = gradeList.reduce((sum, grade) => {
      const points = GRADE_TO_POINTS[grade.grade || ""] || 0
      return sum + points
    }, 0)

    setGpa(totalPoints / gradeList.length)
  }

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("user_grades")
      .insert({
        user_id: user.id,
        course_code: newCourseCode,
        grade: newGrade,
      })

    if (error) {
      console.error("Error adding grade:", error)
    } else {
      const updatedGrades = [...grades, {
        id: 0,
        user_id: user.id,
        course_code: newCourseCode,
        grade: newGrade,
      }]
      setGrades(updatedGrades)
      calculateGPA(updatedGrades)
      setNewCourseCode("")
      setNewGrade("")
    }
  }

  const gradeDistribution = grades.reduce((acc, grade) => {
    const g = grade.grade || "Unknown"
    acc[g] = (acc[g] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(gradeDistribution).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            NordNotes
          </Link>
          <nav className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost">Marketplace</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Current GPA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {gpa !== null ? gpa.toFixed(2) : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGrade} className="space-y-4">
                <div>
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="e.g., STK1110"
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value.toUpperCase())}
                    placeholder="A, B, C, D, E, F"
                    maxLength={1}
                  />
                </div>
                <Button type="submit" className="w-full">Add Grade</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {chartData.length > 0 && (
          <GPAChart data={chartData} title="Grade Distribution" />
        )}

        {grades.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>All Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {grades.map((grade) => (
                  <div key={grade.id} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">{grade.course_code}</span>
                    <span className="text-lg">{grade.grade}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}


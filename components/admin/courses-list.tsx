"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  BookOpen,
  Eye,
  EyeOff,
  Calendar,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface Course {
  id: string
  slug: string
  title: string
  description: string | null
  published: boolean
  createdAt: Date
  modules: Array<{
    id: string
    title: string
    _count: {
      lessons: number
    }
  }>
}

interface CoursesListProps {
  courses: Course[]
}

export default function CoursesList({ courses: initialCourses }: CoursesListProps) {
  const [courses, setCourses] = useState(initialCourses)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all")

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.slug.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterPublished === "all" ||
      (filterPublished === "published" && course.published) ||
      (filterPublished === "draft" && !course.published)

    return matchesSearch && matchesFilter
  })

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este curso?")) return

    const response = await fetch(`/api/admin/courses/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setCourses(courses.filter((c) => c.id !== id))
    } else {
      alert("Error al eliminar el curso")
    }
  }

  const handleTogglePublished = async (course: Course) => {
    const response = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...course, published: !course.published }),
    })

    if (response.ok) {
      setCourses(
        courses.map((c) => (c.id === course.id ? { ...c, published: !c.published } : c))
      )
    }
  }

  const totalLessons = (course: Course) => {
    return course.modules.reduce((acc, module) => acc + module._count.lessons, 0)
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cursos</h1>
          <p className="text-gray-600 mt-1">Gestiona todos tus cursos educativos</p>
        </div>
        <Button asChild>
          <Link href="/admin/cursos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Curso
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterPublished}
                onChange={(e) => setFilterPublished(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="published">Publicados</option>
                <option value="draft">Borradores</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {searchQuery || filterPublished !== "all"
                ? "No se encontraron cursos con esos filtros"
                : "No hay cursos aún"}
            </p>
            {!searchQuery && filterPublished === "all" && (
              <Button asChild>
                <Link href="/admin/cursos/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear tu primer curso
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
                    {course.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublished(course)}
                      title={course.published ? "Ocultar" : "Publicar"}
                    >
                      {course.published ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {course.published ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Publicado
                    </Badge>
                  ) : (
                    <Badge variant="outline">Borrador</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description || "Sin descripción"}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.modules.length} módulos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{totalLessons(course)} lecciones</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                  <Calendar className="h-3 w-3" />
                  <span>Creado {formatDate(course.createdAt)}</span>
                </div>

                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/admin/cursos/${course.id}/lecciones`}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Lecciones
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="icon">
                    <Link href={`/admin/cursos/${course.id}/editar`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(course.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


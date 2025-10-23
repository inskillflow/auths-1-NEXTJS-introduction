"use client"

import { toggleCoursePublished, deleteCourse } from "@/lib/actions"
import { useState } from "react"

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string | null
    category: string
    level: string
    price: any
    published: boolean
    createdAt: Date
  }
}

export function CourseCard({ course }: CourseCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleTogglePublish = async () => {
    setIsLoading(true)
    try {
      await toggleCoursePublished(course.id)
    } catch (error) {
      console.error('Error toggling publish:', error)
      alert('Erreur lors de la modification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return
    
    setIsLoading(true)
    try {
      await deleteCourse(course.id)
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setIsLoading(false)
    }
  }

  const price = parseFloat(course.price.toString())

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          course.published
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {course.published ? 'Publié' : 'Brouillon'}
        </span>
      </div>

      {course.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {course.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
          {course.category}
        </span>
        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
          {course.level}
        </span>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
          {price === 0 ? 'Gratuit' : `${price} €`}
        </span>
      </div>

      <div className="text-xs text-gray-500 mb-3">
        Créé le {new Date(course.createdAt).toLocaleDateString('fr-FR')}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleTogglePublish}
          disabled={isLoading}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 ${
            course.published
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {course.published ? 'Dépublier' : 'Publier'}
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}


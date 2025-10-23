import { CourseCard } from "./CourseCard"

interface Course {
  id: string
  title: string
  description: string | null
  category: string
  level: string
  price: any
  published: boolean
  createdAt: Date
}

interface CourseListProps {
  courses: Course[]
}

export function CourseList({ courses }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Aucun cours</h2>
        <p className="text-gray-600 mb-4">
          Vous n'avez pas encore créé de cours.
        </p>
        <p className="text-sm text-gray-500">
          Les cours d'exemple ont normalement été créés automatiquement à votre première connexion.
          <br />
          Si vous ne les voyez pas, rafraîchissez la page.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Mes Cours ({courses.length})
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}


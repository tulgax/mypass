import { ClassForm } from '@/components/dashboard/ClassForm'

export default function NewClassPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create New Class</h1>
        <p className="text-muted-foreground">Add a new class to your studio</p>
      </div>
      <ClassForm />
    </div>
  )
}

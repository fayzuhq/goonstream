import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function TagsPage() {
  const supabase = await createClient()

  const { data: tags } = await supabase.from('tags').select('*').order('name')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tags</h1>

      <div className="flex flex-wrap gap-3">
        {tags?.map(tag => (
          <Link
            key={tag.id}
            href={`/tag/${tag.slug}`}
            className="px-6 py-3 bg-[var(--surface)] border border-[var(--surface-border)] rounded-full text-sm font-medium hover:border-[#ff9933] hover:text-[#ff9933] transition-colors"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

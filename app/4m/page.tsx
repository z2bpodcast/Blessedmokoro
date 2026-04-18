import { redirect } from 'next/navigation'

export default function FourMRedirectPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const params = searchParams || {}
  const qs = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v))
    } else if (typeof value === 'string') {
      qs.set(key, value)
    }
  }

  const suffix = qs.toString()
  redirect(`/ai-income${suffix ? `?${suffix}` : ''}`)
}

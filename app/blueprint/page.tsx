// FILE: app/blueprint/page.tsx
// Blueprint page removed — redirects to /invite
import { redirect } from 'next/navigation'

export default function BlueprintPage() {
  redirect('/invite')
}

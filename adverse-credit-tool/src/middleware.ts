import { updateSession } from '@/lib/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /**
     * Match all request paths except:
     * - root `/`
     * - policy pages (`/privacy-policy`, `/terms`, etc.)
     * - next static/image files
     * - favicon
     * - images (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    '/((?!$|privacy-policy|terms|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// app/api/revalidate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * POST /api/revalidate
 * Body: { paths: ["/works", "/works/tatlin-apartments"] }
 */
export async function POST(request: NextRequest) {
  try {
    const { paths } = await request.json()

    if (!paths || !Array.isArray(paths)) {
      return NextResponse.json({ error: 'Provide an array of paths' }, { status: 400 })
    }

    for (const path of paths) {
      revalidatePath(path)
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_BUCKETS = ['news-images', 'press-images', 'homepage-images', 'project-images']
const RESIZABLE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/tiff']
const MAX_DIMENSION = 700

/**
 * POST /api/upload
 * Body: multipart/form-data with fields: file, bucket, path
 * Returns: { publicUrl: string }
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = formData.get('bucket') as string | null
    const path = formData.get('path') as string | null

    if (!file || !bucket || !path) {
      return NextResponse.json(
        { error: 'Missing required fields: file, bucket, path' },
        { status: 400 }
      )
    }

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json(
        { error: `Bucket "${bucket}" is not allowed` },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    let uploadData: Buffer | ArrayBuffer = arrayBuffer
    const contentType = file.type || 'application/octet-stream'

    if (RESIZABLE_TYPES.includes(contentType)) {
      uploadData = await sharp(Buffer.from(arrayBuffer))
        .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside' })
        .toBuffer()
    }

    const supabase = createAdminClient()

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, uploadData, {
        upsert: true,
        contentType,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return NextResponse.json({ publicUrl })
  } catch (error) {
    console.error('Upload route error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { gallery } from '@/data/gallery'

export async function GET() {
  return NextResponse.json(gallery)
}

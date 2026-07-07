import { NextResponse } from 'next/server'
import { amenities } from '@/data/amenities'

export async function GET() {
  return NextResponse.json(amenities)
}

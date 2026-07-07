import { NextResponse } from 'next/server'
import { experiences } from '@/data/experiences'

export async function GET() {
  return NextResponse.json(experiences)
}

import { NextResponse } from 'next/server'
import { offers } from '@/data/offers'

export async function GET() {
  return NextResponse.json(offers)
}

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Simple test route called')
    console.log('Environment variables:')
    console.log('DATABASE_URL:', process.env.DATABASE_URL)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Simple test route working',
      env: {
        DATABASE_URL: process.env.DATABASE_URL || 'NOT_SET',
        NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
      }
    })
  } catch (error) {
    console.error('Simple test failed:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Simple test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing database connection...')
    console.log('Environment variables:')
    console.log('DATABASE_URL:', process.env.DATABASE_URL)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    
    // Try to create a new Prisma client with explicit environment variable
    const databaseUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/sk_project'
    console.log('Using DATABASE_URL:', databaseUrl)
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    })
    
    // Test basic connection
    await prisma.$connect()
    console.log('Database connection successful')
    
    // Test a simple query
    const tableCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'sk_project'`
    console.log('Table count:', tableCount)
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection working',
      tableCount,
      databaseUrl
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        env: {
          DATABASE_URL: process.env.DATABASE_URL,
          NODE_ENV: process.env.NODE_ENV
        }
      },
      { status: 500 }
    )
  }
}

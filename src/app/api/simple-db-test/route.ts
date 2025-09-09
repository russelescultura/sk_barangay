import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Simple DB test route called')
    
    // Create a new Prisma client
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'mysql://root:@localhost:3306/sk_project'
        }
      }
    })
    
    console.log('Prisma client created')
    
    // Just try to connect
    await prisma.$connect()
    console.log('Database connection successful')
    
    // Disconnect
    await prisma.$disconnect()
    console.log('Database disconnected')
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection working'
    })
  } catch (error) {
    console.error('Simple DB test failed:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

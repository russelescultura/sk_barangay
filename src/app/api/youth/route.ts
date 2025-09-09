import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const youthProfiles = await prisma.youthProfile.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(youthProfiles)
  } catch (error) {
    console.error('Failed to fetch youth profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch youth profiles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['fullName', 'dateOfBirth', 'sex', 'mobileNumber', 'barangay', 'streetAddress', 'educationLevel', 'schoolName', 'committee', 'status']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Calculate age from date of birth
    const birthDate = new Date(body.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age

    // Generate tracking ID
    const trackingId = `SK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

    // Handle profilePicture validation
    let profilePicture = null
    if (body.profilePicture && typeof body.profilePicture === 'string' && body.profilePicture.trim() !== '') {
      profilePicture = body.profilePicture
    }

    const youthProfile = await prisma.youthProfile.create({
      data: {
        trackingId,
        fullName: body.fullName,
        dateOfBirth: new Date(body.dateOfBirth),
        age: actualAge,
        sex: body.sex,
        civilStatus: body.civilStatus || 'Single',
        profilePicture,
        mobileNumber: body.mobileNumber,
        emailAddress: body.emailAddress,
        barangay: body.barangay,
        streetAddress: body.streetAddress,
        educationLevel: body.educationLevel,
        schoolName: body.schoolName,
        courseStrand: body.courseStrand,
        gradeLevel: body.gradeLevel || null,
        isGraduated: body.isGraduated === 'true',
        lastSchoolYear: body.lastSchoolYear,
        skills: body.skills || '',
        hobbies: body.hobbies || '',
        preferredPrograms: body.preferredPrograms || '',
        isEmployed: body.isEmployed === 'true',
        occupation: body.occupation,
        workingHours: body.workingHours,
        skMembership: body.skMembership === 'true',
        volunteerExperience: body.volunteerExperience || '',
        leadershipRoles: body.leadershipRoles || '',
        isPWD: body.isPWD === 'true',
        pwdType: body.pwdType,
        indigenousGroup: body.indigenousGroup,
        isSoloParent: body.isSoloParent === 'true',
        specialCases: body.specialCases,
        emergencyContactPerson: body.emergencyContactPerson,
        emergencyContactNumber: body.emergencyContactNumber,
        emergencyRelationship: body.emergencyRelationship,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        status: body.status,
        committee: body.committee,
        participation: 0,
        dateOfRegistration: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0]
      }
    })

    return NextResponse.json(youthProfile, { status: 201 })
  } catch (error) {
    console.error('Failed to create youth profile:', error)
    return NextResponse.json(
      { error: 'Failed to create youth profile' },
      { status: 500 }
    )
  }
} 
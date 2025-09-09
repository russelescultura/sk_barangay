import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { submissionId, formTitle } = body

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Missing submission ID' },
        { status: 400 }
      )
    }

    // Check if this is a Youth Registration Form
    if (!formTitle || !formTitle.toLowerCase().includes('youth registration')) {
      return NextResponse.json(
        { error: 'This feature is only available for Youth Registration Forms' },
        { status: 400 }
      )
    }

    // Get the submission with form data
    const submission = await prisma.formSubmission.findUnique({
      where: { id: submissionId },
      include: {
        form: true
      }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Parse the submission data
    let submissionData: any = {}
    try {
      submissionData = JSON.parse(submission.data)
    } catch (error) {
      console.error('Error parsing submission data:', error)
      return NextResponse.json(
        { error: 'Invalid submission data format' },
        { status: 400 }
      )
    }

    // Map form fields to youth profile fields
    const youthProfileData = mapFormDataToYouthProfile(submissionData)

    // Check if youth profile already exists for this submission
    const existingProfile = await prisma.youthProfile.findFirst({
      where: {
        fullName: youthProfileData.fullName,
        mobileNumber: youthProfileData.mobileNumber,
        dateOfBirth: youthProfileData.dateOfBirth
      }
    })

    if (existingProfile) {
      return NextResponse.json(
        { 
          error: 'Youth profile already exists for this person',
          existingProfile 
        },
        { status: 409 }
      )
    }

    // Calculate age from date of birth
    const birthDate = new Date(youthProfileData.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age

    // Generate tracking ID
    const trackingId = `SK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

    // Create youth profile
    const youthProfile = await prisma.youthProfile.create({
      data: {
        trackingId,
        fullName: youthProfileData.fullName,
        dateOfBirth: new Date(youthProfileData.dateOfBirth),
        age: actualAge,
        sex: youthProfileData.sex,
        civilStatus: youthProfileData.civilStatus || 'Single',
        profilePicture: youthProfileData.profilePicture,
        mobileNumber: youthProfileData.mobileNumber,
        emailAddress: youthProfileData.emailAddress,
        barangay: youthProfileData.barangay,
        streetAddress: youthProfileData.streetAddress,
        educationLevel: youthProfileData.educationLevel,
        schoolName: youthProfileData.schoolName,
        courseStrand: youthProfileData.courseStrand,
        gradeLevel: youthProfileData.gradeLevel,
        isGraduated: youthProfileData.isGraduated === 'Yes' || youthProfileData.isGraduated === 'true' || youthProfileData.isGraduated === true,
        lastSchoolYear: youthProfileData.lastSchoolYear,
        skills: youthProfileData.skills || '',
        hobbies: youthProfileData.hobbies || '',
        preferredPrograms: youthProfileData.preferredPrograms || '',
        isEmployed: youthProfileData.isEmployed === 'Yes' || youthProfileData.isEmployed === 'true' || youthProfileData.isEmployed === true,
        occupation: youthProfileData.occupation,
        workingHours: youthProfileData.workingHours,
        skMembership: youthProfileData.skMembership === 'Yes' || youthProfileData.skMembership === 'true' || youthProfileData.skMembership === true,
        volunteerExperience: youthProfileData.volunteerExperience || '',
        leadershipRoles: youthProfileData.leadershipRoles || '',
        isPWD: youthProfileData.isPWD === 'Yes' || youthProfileData.isPWD === 'true' || youthProfileData.isPWD === true,
        pwdType: youthProfileData.pwdType,
        indigenousGroup: youthProfileData.indigenousGroup,
        isSoloParent: youthProfileData.isSoloParent === 'Yes' || youthProfileData.isSoloParent === 'true' || youthProfileData.isSoloParent === true,
        specialCases: youthProfileData.specialCases,
        emergencyContactPerson: youthProfileData.emergencyContactPerson,
        emergencyContactNumber: youthProfileData.emergencyContactNumber,
        emergencyRelationship: youthProfileData.emergencyRelationship,
        latitude: youthProfileData.latitude || null,
        longitude: youthProfileData.longitude || null,
        status: 'Active',
        committee: youthProfileData.committee || 'General',
        participation: 0,
        dateOfRegistration: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0]
      }
    })

    // Update submission with youth profile reference
    await prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        notes: `Youth profile automatically created: ${youthProfile.trackingId}`
      }
    })

    return NextResponse.json({
      success: true,
      youthProfile,
      message: 'Youth profile created successfully from form submission'
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to create youth profile from submission:', error)
    return NextResponse.json(
      { error: 'Failed to create youth profile from submission' },
      { status: 500 }
    )
  }
}

// Helper function to map form data to youth profile fields
function mapFormDataToYouthProfile(data: any) {
  const mapping: any = {
    // Basic Information
    fullName: data.fullName || data.name || data['Full Name'] || data['Complete Name'],
    dateOfBirth: data.dateOfBirth || data.birthDate || data['Date of Birth'] || data.dob,
    sex: data.sex || data.gender || data['Sex'] || data['Gender'] || data['Select Gender'],
    civilStatus: data.civilStatus || data['Civil Status'] || data.maritalStatus,
    mobileNumber: data.mobileNumber || data.phone || data['Mobile Number'] || data['Contact Number'] || data['Enter mobile number'],
    emailAddress: data.emailAddress || data.email || data['Email Address'],
    profilePicture: data.profilePicture || data['Profile Picture (2x2)*'] || data['Profile Picture (2x2)'] || data['Profile Picture'],
    
    // Address Information
    barangay: data.barangay || data['Barangay'] || data['Municipality and Barangay '] || 'Tulay',
    streetAddress: data.streetAddress || data.address || data['Street Address'] || data['Complete Address'] || data['Street Address/Purok'],
    
    // Education Information
    educationLevel: data.educationLevel || data['Education Level'] || data['Current Education Level'] || data.level,
    schoolName: data.schoolName || data.school || data['School Name'] || data['Current School'],
    courseStrand: data.courseStrand || data.course || data['Course/Strand'] || data['Course/Strand (if SHS/College)'] || data['Program'],
    gradeLevel: data.gradeLevel || data.grade || data['Grade Level'] || data['Year Level'] || data['Enter your grade/year level'],
    isGraduated: data.isGraduated || data.graduated || data['Is Graduated'] || data['Graduated?'],
    lastSchoolYear: data.lastSchoolYear || data['Last School Year'] || data['Last School Year Attended'],
    
    // Skills and Interests
    skills: data.skills || data['Skills'] || data['Special Skills'],
    hobbies: data.hobbies || data['Hobbies'] || data['Interests'] || data['Hobbies/Interests'],
    preferredPrograms: data.preferredPrograms || data['Preferred Programs'] || data['Programs of Interest'] || data['Preferred SK Programs'],
    
    // Employment Information
    isEmployed: data.isEmployed || data.employed || data['Is Employed'] || data['Employed?'],
    occupation: data.occupation || data.job || data['Occupation'] || data['Current Job'] || data['Occupation (if employed)'],
    workingHours: data.workingHours || data['Working Hours'],
    
    // SK Membership
    skMembership: data.skMembership || data.sk || data['SK Membership'] || data['SK Member'] || data['SK Membership or Affiliation'],
    volunteerExperience: data.volunteerExperience || data['Volunteer Experience'] || data['Volunteer Work'] || data['Community Service'],
    leadershipRoles: data.leadershipRoles || data['Leadership Roles'] || data['Leadership Role Held'],
    
    // Special Cases
    isPWD: data.isPWD || data.pwd || data['Is PWD'] || data['Person with Disability'] || data['PWD Status'],
    pwdType: data.pwdType || data['PWD Type'] || data['Type of Disability'] || data['PWD Type (if Yes)'],
    indigenousGroup: data.indigenousGroup || data['Indigenous Group'] || data['Ethnic Group'] || data['Indigenous Group Affiliation'],
    isSoloParent: data.isSoloParent || data['Is Solo Parent'] || data['Single Parent'] || data['Solo Parent'],
    specialCases: data.specialCases || data['Special Cases'],
    
    // Emergency Contact
    emergencyContactPerson: data.emergencyContactPerson || data['Emergency Contact Person'] || data['Emergency Contact'] || data['Emergency Contact Person'],
    emergencyContactNumber: data.emergencyContactNumber || data['Emergency Contact Number'] || data['Emergency Phone'] || data['Emergency Contact Number'],
    emergencyRelationship: data.emergencyRelationship || data['Emergency Relationship'] || data['Relationship'],
    
    // Location
    latitude: data.latitude,
    longitude: data.longitude,
    
    // Committee
    committee: data.committee || data['Committee'] || data['Committee '] || 'General'
  }

  // Clean up undefined values
  Object.keys(mapping).forEach(key => {
    if (mapping[key] === undefined) {
      delete mapping[key]
    }
  })

  return mapping
}

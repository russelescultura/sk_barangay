import pool from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding database...')
  
  try {
    // Clear existing data
    await pool.execute('DELETE FROM form_submissions')
    await pool.execute('DELETE FROM forms')
    await pool.execute('DELETE FROM event_assignments')
    await pool.execute('DELETE FROM events')
    await pool.execute('DELETE FROM program_assignments')
    await pool.execute('DELETE FROM programs')
    await pool.execute('DELETE FROM users')
    
    const users = [
      {
        id: 'user1',
        name: 'Maria Santos',
        email: 'maria.santos@sk.gov.ph',
        password: await bcrypt.hash('password123', 10),
        role: 'ADMIN',
        profileImage: '/images/profiles/maria-santos.jpg'
      },
      {
        id: 'user2',
        name: 'Juan Dela Cruz',
        email: 'juan.delacruz@sk.gov.ph',
        password: await bcrypt.hash('password123', 10),
        role: 'ADMIN',
        profileImage: '/images/profiles/juan-delacruz.jpg'
      },
      {
        id: 'user3',
        name: 'Ana Reyes',
        email: 'ana.reyes@sk.gov.ph',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
        profileImage: '/images/profiles/ana-reyes.jpg'
      },
      {
        id: 'user4',
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@sk.gov.ph',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
        profileImage: '/images/profiles/carlos-mendoza.jpg'
      },
      {
        id: 'user5',
        name: 'Carmen Lopez',
        email: 'carmen.lopez@sk.gov.ph',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
        profileImage: '/images/profiles/carmen-lopez.jpg'
      },
      {
        id: 'user6',
        name: 'Luis Martinez',
        email: 'luis.martinez@sk.gov.ph',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
        profileImage: '/images/profiles/luis-martinez.jpg'
      }
    ]

    // Create users
    for (const user of users) {
      await pool.execute(`
        INSERT INTO users (id, name, email, password, role, profile_image)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [user.id, user.name, user.email, user.password, user.role, user.profileImage])
    }

    // Create sample programs
    const programs = [
      {
        id: 'prog1',
        title: 'Youth Leadership Development Program',
        description: 'A comprehensive program designed to develop leadership skills among young people in the community.',
        objectives: 'To empower youth with leadership skills, foster community engagement, and prepare future leaders.',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-31'),
        targetAudience: 'Youth aged 15-30',
        status: 'ONGOING'
      },
      {
        id: 'prog2',
        title: 'Community Health Awareness Campaign',
        description: 'Promoting health awareness and wellness practices in the community.',
        objectives: 'To improve community health awareness and promote healthy lifestyle practices.',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-08-31'),
        targetAudience: 'All community members',
        status: 'ONGOING'
      }
    ]

    for (const program of programs) {
      await pool.execute(`
        INSERT INTO programs (id, title, description, objectives, start_date, end_date, target_audience, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [program.id, program.title, program.description, program.objectives, program.startDate, program.endDate, program.targetAudience, program.status])
    }

    // Assign users to programs
    await pool.execute(`
      INSERT INTO program_assignments (program_id, user_id)
      VALUES (?, ?), (?, ?)
    `, ['prog1', 'user1', 'prog2', 'user2'])

    // Create sample events
    const events = [
      {
        id: 'event1',
        title: 'Leadership Workshop',
        description: 'A hands-on workshop to develop leadership skills among youth.',
        dateTime: new Date('2024-02-15T09:00:00'),
        venue: 'Barangay Hall Conference Room',
        maxParticipants: 30,
        status: 'PLANNED',
        programId: 'prog1'
      },
      {
        id: 'event2',
        title: 'Health Seminar',
        description: 'Educational seminar on health and wellness practices.',
        dateTime: new Date('2024-03-20T14:00:00'),
        venue: 'Community Center',
        maxParticipants: 50,
        status: 'ACTIVE',
        programId: 'prog2'
      }
    ]

    for (const event of events) {
      await pool.execute(`
        INSERT INTO events (id, title, description, date_time, venue, max_participants, status, program_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [event.id, event.title, event.description, event.dateTime, event.venue, event.maxParticipants, event.status, event.programId])
    }

    // Assign users to events
    await pool.execute(`
      INSERT INTO event_assignments (event_id, user_id)
      VALUES (?, ?), (?, ?)
    `, ['event1', 'user1', 'event2', 'user2'])

    // Create sample forms
    const forms = [
      {
        id: 'form1',
        title: 'Leadership Workshop Registration',
        type: 'REGISTRATION',
        fields: JSON.stringify([
          { name: 'fullName', label: 'Full Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
          { name: 'age', label: 'Age', type: 'number', required: true }
        ]),
        fileUpload: false,
        gcashReceipt: false,
        submissionLimit: 30,
        submissionDeadline: new Date('2024-02-10T23:59:59'),
        isActive: true,
        eventId: 'event1'
      },
      {
        id: 'form2',
        title: 'Health Seminar Survey',
        type: 'SURVEY',
        fields: JSON.stringify([
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'feedback', label: 'Feedback', type: 'textarea', required: true },
          { name: 'rating', label: 'Rating', type: 'select', options: ['1', '2', '3', '4', '5'], required: true }
        ]),
        fileUpload: true,
        gcashReceipt: false,
        submissionLimit: 100,
        submissionDeadline: new Date('2024-03-25T23:59:59'),
        isActive: true,
        eventId: 'event2'
      }
    ]

    for (const form of forms) {
      await pool.execute(`
        INSERT INTO forms (id, title, type, fields, file_upload, gcash_receipt, submission_limit, submission_deadline, is_active, event_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [form.id, form.title, form.type, form.fields, form.fileUpload, form.gcashReceipt, form.submissionLimit, form.submissionDeadline, form.isActive, form.eventId])
    }

    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  }) 
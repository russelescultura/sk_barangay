import { prisma } from '@/lib/prisma'

const initialLocations = [
    {
        name: "Casiguran Central School",
        description: "Main educational institution in Casiguran",
        address: "Casiguran, Sorsogon, Philippines",
        latitude: 12.8728,
        longitude: 124.0092,
        type: 'SCHOOL' as const
    },
    {
        name: "Casiguran Barangay Hall",
        description: "Main government office and administrative center",
        address: "Casiguran, Sorsogon, Philippines",
        latitude: 12.8735,
        longitude: 124.0088,
        type: 'GOVERNMENT' as const
    },
    {
        name: "Casiguran Health Center",
        description: "Primary healthcare facility for residents",
        address: "Casiguran, Sorsogon, Philippines",
        latitude: 12.8720,
        longitude: 124.0095,
        type: 'HEALTH' as const
    },
    {
        name: "Casiguran Public Market",
        description: "Main marketplace for local commerce",
        address: "Casiguran, Sorsogon, Philippines",
        latitude: 12.8740,
        longitude: 124.0085,
        type: 'COMMERCIAL' as const
    },
    {
        name: "Casiguran Municipal Hall",
        description: "Municipal government office",
        address: "Casiguran, Sorsogon, Philippines",
        latitude: 12.8745,
        longitude: 124.0080,
        type: 'GOVERNMENT' as const
    },
    {
        name: "Casiguran Basketball Court",
        description: "Community sports and recreation facility",
        address: "Casiguran, Sorsogon, Philippines",
        latitude: 12.8725,
        longitude: 124.0090,
        type: 'SPORTS' as const
    }
]

export async function seedLocations() {
    try {
        // Check if locations already exist
        const existingLocations = await prisma.location.count()
        
        if (existingLocations > 0) {
            console.log('Locations already exist in database')
            return
        }

        // Create the locations
        for (const location of initialLocations) {
            await prisma.location.create({
                data: location
            })
        }

        console.log('Successfully seeded locations')
    } catch (error) {
        console.error('Error seeding locations:', error)
        throw error
    }
}

if (require.main === module) {
    seedLocations()
        .then(() => {
            console.log('Seeding completed')
            process.exit(0)
        })
        .catch((error) => {
            console.error('Seeding failed:', error)
            process.exit(1)
        })
}
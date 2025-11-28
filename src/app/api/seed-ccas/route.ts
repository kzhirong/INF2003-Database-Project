import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import CCA from '@/models/CCA';

export async function POST() {
  try {
    await connectDB();

    // Clear existing CCAs (for testing)
    await CCA.deleteMany({});

    // Create sample CCAs
    const sampleCCAs = [
      {
        _id: 'basketball',
        name: 'BASKETBALL',
        category: 'Sports',
        schedule: [
          {
            day: 'Monday',
            startTime: '18:00',
            endTime: '20:00',
            location: 'Sports Hall, Level 1'
          },
          {
            day: 'Wednesday',
            startTime: '18:00',
            endTime: '20:00',
            location: 'Sports Hall, Level 1'
          }
        ],
        commitment: 'Schedule Based',
        sportType: 'Competitive',
        heroImage: '/basketball-hero.jpg',
        shortDescription: 'Join our competitive basketball team and represent SIT in inter-varsity competitions!',
        blocks: [
          {
            id: 'block-1',
            type: 'text',
            order: 0,
            config: {
              content: 'Basketball at SIT is more than just a sport – it\'s a community of passionate athletes dedicated to excellence. We compete in IVP tournaments and organize regular training sessions to develop both skills and teamwork.',
              alignment: 'left',
              fontSize: 'medium'
            }
          },
          {
            id: 'block-2',
            type: 'events',
            order: 1,
            config: {
              title: 'Upcoming Events',
              layout: 'grid',
              events: [
                {
                  title: 'Inter-Hall Championship',
                  date: '2024-03-15',
                  time: '2:00 PM',
                  location: 'Main Sports Hall',
                  description: 'Annual inter-hall basketball tournament'
                },
                {
                  title: 'Training Camp',
                  date: '2024-04-05',
                  time: 'All Day',
                  location: 'SIT Campus',
                  description: 'Intensive training camp for all members'
                }
              ]
            }
          },
          {
            id: 'block-3',
            type: 'leadership',
            order: 2,
            config: {
              title: 'Leadership Team',
              layout: 'grid',
              members: [
                {
                  name: 'John Tan',
                  role: 'Captain',
                  year: 'Year 3',
                  course: 'Computer Science'
                },
                {
                  name: 'Sarah Lee',
                  role: 'Vice Captain',
                  year: 'Year 2',
                  course: 'Engineering'
                }
              ]
            }
          },
          {
            id: 'block-4',
            type: 'achievements',
            order: 3,
            config: {
              title: 'Our Achievements',
              style: 'list',
              achievements: [
                'IVP Championship 2023 - Champions',
                'Best Team Spirit Award 2023',
                'Inter-Hall Tournament Winners 2022'
              ]
            }
          }
        ],
        createdBy: '1', // Assuming user ID 1
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'dragon-boat',
        name: 'DRAGON BOAT',
        category: 'Sports',
        schedule: [
          {
            day: 'Tuesday',
            startTime: '05:30',
            endTime: '07:00',
            location: 'Marina Bay'
          },
          {
            day: 'Thursday',
            startTime: '05:30',
            endTime: '07:00',
            location: 'Marina Bay'
          },
          {
            day: 'Saturday',
            startTime: '05:30',
            endTime: '07:30',
            location: 'Marina Bay'
          }
        ],
        commitment: 'Schedule Based',
        sportType: 'Competitive',
        heroImage: '/dragon-boat-hero.jpg',
        shortDescription: 'Experience the thrill of dragon boating - a water sport that combines strength, rhythm, and teamwork!',
        blocks: [
          {
            id: 'block-1',
            type: 'text',
            order: 0,
            config: {
              content: 'Dragon Boat is one of the most exciting water sports at SIT. Our team trains rigorously to compete in national and international competitions. No prior experience needed - we welcome everyone!',
              alignment: 'left',
              fontSize: 'medium'
            }
          },
          {
            id: 'block-2',
            type: 'gallery',
            order: 1,
            config: {
              images: [
                '/dragon-boat-1.jpg',
                '/dragon-boat-2.jpg',
                '/dragon-boat-3.jpg',
                '/dragon-boat-4.jpg'
              ],
              columns: 2,
              caption: 'Our team in action at competitions'
            }
          },
          {
            id: 'block-3',
            type: 'cta',
            order: 2,
            config: {
              title: 'Ready to Join?',
              description: 'Come for a trial session and experience the adrenaline rush!',
              buttonText: 'Sign Up Now',
              buttonLink: '/join',
              backgroundColor: '#F44336'
            }
          }
        ],
        createdBy: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'drama-club',
        name: 'DRAMA CLUB',
        category: 'Arts & Culture',
        commitment: 'Flexible',
        heroImage: '/drama-hero.jpg',
        shortDescription: 'Unleash your creativity and passion for performing arts with SIT Drama Club!',
        blocks: [
          {
            id: 'block-1',
            type: 'text',
            order: 0,
            config: {
              content: 'SIT Drama Club is a vibrant community of performers, directors, writers, and tech enthusiasts. We produce original plays, participate in theatre festivals, and organize workshops with industry professionals.',
              alignment: 'center',
              fontSize: 'large'
            }
          },
          {
            id: 'block-2',
            type: 'achievements',
            order: 1,
            config: {
              title: 'Recent Productions',
              style: 'badges',
              achievements: [
                'Best Production - Inter-University Theatre Fest 2023',
                'Original Play: "Digital Dreams" - Sold Out Shows',
                'Collaboration with TheatreWorks'
              ]
            }
          },
          {
            id: 'block-3',
            type: 'stats',
            order: 2,
            config: {
              layout: 'horizontal',
              stats: [
                { label: 'Productions', value: '5', icon: '🎭' },
                { label: 'Members', value: '18', icon: '👥' },
                { label: 'Awards', value: '3', icon: '🏆' }
              ]
            }
          }
        ],
        createdBy: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert sample CCAs
    const result = await CCA.insertMany(sampleCCAs);

    return NextResponse.json({
      success: true,
      message: `Seeded ${result.length} CCAs successfully`,
      data: result
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error seeding CCAs:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

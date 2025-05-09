import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  // Remove all related records first to avoid foreign key constraints
  await prisma.review.deleteMany();
  await prisma.track.deleteMany();
  await prisma.album.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.podcast.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const salt = await bcrypt.genSalt(10);
  
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@audora.com",
      name: "Admin",
      password: await bcrypt.hash("admin123", salt),
      role: "ADMIN"
    }
  });

  const normalUser = await prisma.user.create({
    data: {
      email: "user@audora.com",
      name: "Regular User",
      password: await bcrypt.hash("password123", salt),
      role: "USER"
    }
  });

  // Create Albums + Tracks with Cloudinary URLs
  const album1 = await prisma.album.create({
    data: {
      title: "WILDFLOWER",
      artist: "Billie Eilish",
      coverUrl: "https://t2.genius.com/unsafe/344x344/https%3A%2F%2Fimages.genius.com%2Fb826bffa6a542a466c2143f4702b9f25.1000x1000x1.png",
      tracks: {
        create: [
          {
            title: "WILDFLOWER",
            duration: 180,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054444/Billie_Eilish_-_WILDFLOWER_Official_Lyric_Video_evhsdd.mp3"
          }
        ]
      }
    },
    include: {
      tracks: true
    }
  });

  const album2 = await prisma.album.create({
    data: {
      title: "After Hours",
      artist: "The Weeknd",
      coverUrl: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png",
      tracks: {
        create: [
          {
            title: "After Hours",
            duration: 240,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054425/after_hours_ded5tr.mp3"
          }
        ]
      }
    },
    include: {
      tracks: true
    }
  });

  const album3 = await prisma.album.create({
    data: {
      title: "Stay",
      artist: "The Kid LAROI & Justin Bieber",
      coverUrl: "https://upload.wikimedia.org/wikipedia/en/0/0c/The_Kid_Laroi_and_Justin_Bieber_-_Stay.png",
      tracks: {
        create: [
          {
            title: "Stay",
            duration: 210,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054389/Stay_ybim8r.mp3"
          }
        ]
      }
    },
    include: {
      tracks: true
    }
  });

  const album4 = await prisma.album.create({
    data: {
      title: "Eternity",
      artist: "Chill Artist",
      coverUrl: "https://i.scdn.co/image/ab67616d0000b273b9a9b36b0e159b3485282cad",
      tracks: {
        create: [
          {
            title: "Eternity",
            duration: 195,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054386/Eternity_p08yrm.mp3"
          }
        ]
      }
    },
    include: {
      tracks: true
    }
  });

  const album5 = await prisma.album.create({
    data: {
      title: "One of the Boys",
      artist: "Katy Perry",
      coverUrl: "https://upload.wikimedia.org/wikipedia/en/6/60/One_of_the_Boys.jpg",
      tracks: {
        create: [
          {
            title: "Hot N Cold",
            duration: 220,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054381/Katy_Perry_-_Hot_N_Cold_xksfuk.mp3"
          }
        ]
      }
    },
    include: {
      tracks: true
    }
  });

  // Create Podcast + Episodes
  const podcast1 = await prisma.podcast.create({
    data: {
      title: "Deep Dive Talks",
      host: "Samir Talks",
      coverUrl: "https://images.unsplash.com/photo-1617926793205-00b1a648ebe9",
      episodes: {
        create: [
          {
            title: "The Startup Grind",
            duration: 2400,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054444/Billie_Eilish_-_WILDFLOWER_Official_Lyric_Video_evhsdd.mp3"
          },
          {
            title: "AI in 2025",
            duration: 1800,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054425/after_hours_ded5tr.mp3"
          }
        ]
      }
    }
  });
  
  // Add more podcasts
  const podcast2 = await prisma.podcast.create({
    data: {
      title: "Tech Talk Today",
      host: "Alex Chen",
      coverUrl: "https://images.unsplash.com/photo-1589903308904-1010c2294adc",
      episodes: {
        create: [
          {
            title: "The Future of Web Development",
            duration: 1850,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054389/Stay_ybim8r.mp3"
          },
          {
            title: "React vs Angular: The Complete Comparison",
            duration: 2100,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054386/Eternity_p08yrm.mp3"
          },
          {
            title: "Building Scalable Applications",
            duration: 1700,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054381/Katy_Perry_-_Hot_N_Cold_xksfuk.mp3"
          }
        ]
      }
    }
  });
  
  const podcast3 = await prisma.podcast.create({
    data: {
      title: "Health & Wellness Journey",
      host: "Dr. Sarah Johnson",
      coverUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18",
      episodes: {
        create: [
          {
            title: "Nutrition Myths Debunked",
            duration: 2250,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054444/Billie_Eilish_-_WILDFLOWER_Official_Lyric_Video_evhsdd.mp3"
          },
          {
            title: "Meditation for Beginners",
            duration: 1500,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054425/after_hours_ded5tr.mp3"
          }
        ]
      }
    }
  });
  
  const podcast4 = await prisma.podcast.create({
    data: {
      title: "True Crime Stories",
      host: "Detective Mike Richards",
      coverUrl: "https://images.unsplash.com/photo-1551818176-60579e574b91",
      episodes: {
        create: [
          {
            title: "The Mysterious Disappearance",
            duration: 3600,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054389/Stay_ybim8r.mp3"
          },
          {
            title: "Cold Cases Solved",
            duration: 2700,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054386/Eternity_p08yrm.mp3"
          }
        ]
      }
    }
  });
  
  const podcast5 = await prisma.podcast.create({
    data: {
      title: "Financial Freedom",
      host: "Emma Thompson",
      coverUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e",
      episodes: {
        create: [
          {
            title: "Investing for Beginners",
            duration: 2100,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054381/Katy_Perry_-_Hot_N_Cold_xksfuk.mp3"
          },
          {
            title: "Building Wealth in Your 30s",
            duration: 1950,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054444/Billie_Eilish_-_WILDFLOWER_Official_Lyric_Video_evhsdd.mp3"
          },
          {
            title: "Crypto: Risk or Reward?",
            duration: 2400,
            audioUrl: "https://res.cloudinary.com/dnbk3iouw/video/upload/v1746054425/after_hours_ded5tr.mp3"
          }
        ]
      }
    }
  });

  // Create Playlists for Users with tracks from albums
  await prisma.playlist.create({
    data: {
      title: "Admin's Favorites",
      user: {
        connect: { id: adminUser.id }
      },
      tracks: {
        connect: [
          { id: album1.tracks[0].id },
          { id: album2.tracks[0].id },
          { id: album5.tracks[0].id }
        ]
      }
    }
  });

  await prisma.playlist.create({
    data: {
      title: "User's Chill Mix",
      user: {
        connect: { id: normalUser.id }
      },
      tracks: {
        connect: [
          { id: album3.tracks[0].id },
          { id: album4.tracks[0].id }
        ]
      }
    }
  });

  // Add some reviews
  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Amazing album, love every track!",
      contentType: "album",
      contentId: album1.id,
      album: {
        connect: { id: album1.id }
      },
      user: {
        connect: { id: normalUser.id }
      }
    }
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: "Great podcast, very informative.",
      contentType: "podcast",
      contentId: podcast1.id,
      podcast: {
        connect: { id: podcast1.id }
      },
      user: {
        connect: { id: adminUser.id }
      }
    }
  });
  
  // Add more reviews for podcasts
  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Tech Talk Today is my go-to tech podcast!",
      contentType: "podcast",
      contentId: podcast2.id,
      podcast: {
        connect: { id: podcast2.id }
      },
      user: {
        connect: { id: normalUser.id }
      }
    }
  });
  
  await prisma.review.create({
    data: {
      rating: 4,
      comment: "Great health advice in this podcast series.",
      contentType: "podcast",
      contentId: podcast3.id,
      podcast: {
        connect: { id: podcast3.id }
      },
      user: {
        connect: { id: adminUser.id }
      }
    }
  });

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
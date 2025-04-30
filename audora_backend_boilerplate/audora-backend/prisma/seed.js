import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.track.deleteMany();
  await prisma.album.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.podcast.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.user.deleteMany();

  // Create User
  const user = await prisma.user.create({
    data: {
      email: "hesham@audora.com",
      name: "Hesham"
    }
  });

  // Create Albums + Tracks
  const album1 = await prisma.album.create({
    data: {
      title: "Dreamscapes",
      artist: "Echo",
      coverUrl: "https://www.pexels.com/photo/woman-wearing-black-shirt-1323206/",
      tracks: {
        create: [
          {
            title: "Starfall",
            duration: 180,
            audioUrl: "/audio/starfall.mp3"
          },
          {
            title: "Night Drive",
            duration: 200,
            audioUrl: "/audio/nightdrive.mp3"
          }
        ]
      }
    }
  });

  // Create Podcast + Episodes
  const podcast1 = await prisma.podcast.create({
    data: {
      title: "Deep Dive Talks",
      host: "Samir Talks",
      coverUrl: "https://source.unsplash.com/random/400x400?podcast",
      episodes: {
        create: [
          {
            title: "The Startup Grind",
            duration: 2400,
            audioUrl: "/audio/startup.mp3"
          },
          {
            title: "AI in 2025",
            duration: 1800,
            audioUrl: "/audio/ai2025.mp3"
          }
        ]
      }
    }
  });



  

  // Create Playlist for User with tracks from album1
  await prisma.playlist.create({
    data: {
      title: "Hesham' Vibes",
      user: {
        connect: { id: user.id }
      },
      tracks: {
        connect: [
          { id: 1 },
          { id: 2 }
        ]
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
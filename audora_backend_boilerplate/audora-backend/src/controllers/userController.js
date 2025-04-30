import prisma from '../services/prismaClient.js';



//create users
// POST /api/users
export const createUser = async (req, res) => {
    try {
      const { name, email } = req.body;
  
      // Basic validation 
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
  
      const newUser = await prisma.user.create({
        data: { name, email }
      });
  
      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  };
  
  


// GET all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { playlists: true }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// GET single user by ID
export const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { playlists: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

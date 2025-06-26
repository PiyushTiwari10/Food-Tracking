const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// MongoDB connection string
const MONGODB_URI = "mongodb+srv://tiwaritanush640:sT1VueDAU3Bwap9T@cluster0.zhi46qu.mongodb.net/delivery-tracker?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if cannot connect to database
  });

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.get('/api/auth/verify-token', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Error verifying token' });
  }
});

// Place a new order
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { productId, productName, productImage, productPrice } = req.body;
    if (!productId || !productName || !productImage || !productPrice) {
      return res.status(400).json({ message: 'Missing order details' });
    }
    const order = new Order({
      user: req.user.userId,
      productId,
      productName,
      productImage,
      productPrice,
    });
    await order.save();
    res.status(201).json({ message: 'Order placed', order });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ message: 'Error placing order' });
  }
});

// Get all orders for the authenticated user
app.get('/api/orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// --- Socket.IO Real-Time Location Simulation ---
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('track_order', (orderId) => {
    console.log(`Tracking order: ${orderId}`);
    startLocationSimulation(socket, orderId);
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const simulateDeliveryRoute = (orderId) => {
  const startPoint = { lat: 28.6139, lng: 77.2090 };
  const endPoint = {
    lat: startPoint.lat + (Math.random() * 0.05 - 0.025),
    lng: startPoint.lng + (Math.random() * 0.05 - 0.025)
  };
  const steps = 20;
  const route = [];
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const jitter = (Math.random() * 0.002 - 0.001);
    route.push({
      lat: startPoint.lat + (endPoint.lat - startPoint.lat) * progress + jitter,
      lng: startPoint.lng + (endPoint.lng - startPoint.lng) * progress + jitter
    });
  }
  return route;
};

const activeSimulations = new Map();
function startLocationSimulation(socket, orderId) {
  if (activeSimulations.has(orderId)) {
    clearInterval(activeSimulations.get(orderId).interval);
  }
  const route = simulateDeliveryRoute(orderId);
  let currentStep = 0;
  const simulationInterval = setInterval(() => {
    if (currentStep < route.length) {
      const location = route[currentStep];
      socket.emit('location_update', {
        orderId,
        location,
        status: currentStep === route.length - 1 ? 'Delivered' : 'Out for Delivery',
        eta: Math.round((route.length - currentStep) / 2)
      });
      currentStep++;
    } else {
      socket.emit('location_update', {
        orderId,
        location: route[route.length - 1],
        status: 'Delivered',
        eta: 0
      });
      Order.findOneAndUpdate(
        { _id: orderId },
        { status: 'Delivered' },
        { new: true }
      ).catch(err => console.error(`Error updating order status: ${err}`));
      clearInterval(simulationInterval);
      activeSimulations.delete(orderId);
    }
  }, 3000);
  activeSimulations.set(orderId, {
    interval: simulationInterval,
    socket: socket.id
  });
  socket.on('disconnect', () => {
    if (activeSimulations.has(orderId)) {
      clearInterval(activeSimulations.get(orderId).interval);
      activeSimulations.delete(orderId);
    }
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
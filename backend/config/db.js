/**
 * Database Configuration
 * Handles MongoDB connection using Mongoose
 */

const mongoose = require('mongoose');
const dns = require('node:dns');

const DEFAULT_PUBLIC_DNS = ['1.1.1.1', '8.8.8.8'];

/**
 * Configure DNS resolvers for MongoDB SRV lookups.
 * Useful when local DNS does not resolve Atlas SRV records reliably.
 */
const configureMongoDns = () => {
  const shouldForcePublicDns = process.env.MONGO_FORCE_PUBLIC_DNS !== 'false';

  if (!shouldForcePublicDns) {
    return;
  }

  const servers = (process.env.MONGO_DNS_SERVERS || DEFAULT_PUBLIC_DNS.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (servers.length === 0) {
    return;
  }

  try {
    dns.setServers(servers);
    console.log(`DNS resolvers set for MongoDB lookup: ${servers.join(', ')}`);
  } catch (error) {
    console.warn(`Failed to apply custom DNS resolvers: ${error.message}`);
  }

  const dnsOrder = process.env.MONGO_DNS_RESULT_ORDER;
  if (dnsOrder) {
    try {
      dns.setDefaultResultOrder(dnsOrder);
      console.log(`DNS result order set to: ${dnsOrder}`);
    } catch (error) {
      console.warn(`Invalid MONGO_DNS_RESULT_ORDER value: ${dnsOrder}`);
    }
  }
};

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    configureMongoDns();

    // Mongoose connection options
    const options = {
      // useNewUrlParser and useUnifiedTopology are now default in Mongoose 6+
      // but we keep them for compatibility
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;

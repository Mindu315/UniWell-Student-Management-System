const mongoose = require('mongoose');

let careerConnection = null;

const getCareerUri = () =>
  (process.env.CAREER_MONGO_URI || process.env.MONGO_URI || '').trim();

const usesDedicatedCareerDb = () => {
  const careerUri = (process.env.CAREER_MONGO_URI || '').trim();
  const primaryUri = (process.env.MONGO_URI || '').trim();
  return Boolean(careerUri) && careerUri !== primaryUri;
};

const getCareerDbConnection = () => {
  if (!usesDedicatedCareerDb()) {
    return mongoose.connection;
  }

  if (!careerConnection) {
    careerConnection = mongoose.createConnection(getCareerUri(), {});
  }

  return careerConnection;
};

const connectCareerDB = async () => {
  if (!usesDedicatedCareerDb()) {
    console.log('Career DB using primary MongoDB connection');
    return mongoose.connection;
  }

  const connection = getCareerDbConnection();
  await connection.asPromise();
  console.log(`✅ Career MongoDB Connected: ${connection.host}`);
  console.log(`📊 Career Database Name: ${connection.name}`);
  return connection;
};

module.exports = {
  connectCareerDB,
  getCareerDbConnection,
  usesDedicatedCareerDb
};

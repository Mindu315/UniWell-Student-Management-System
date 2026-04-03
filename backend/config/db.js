const mongoose = require("mongoose");

//assign db url into variable
const URL = process.env.MONGO_URI.trim();


//connect to mongodb
mongoose.connect(URL)
.then(async() => {
    console.log("MongoDB Connected Successfully");
    /*console.log("Connected to Database Name:", mongoose.connection.db.databaseName);*/

    // --- ADD THE DEBUG CODE HERE ---
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        /*console.log("Collections actually found in Atlas:", collections.map(c => c.name));*/
    } catch (err) {
        console.log("Error listing collections:", err);
    }

})
.catch((err) => {
    console.log(err);
});

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("Mongodb Connection success!");
})

module.exports = connection;
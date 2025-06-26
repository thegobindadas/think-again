import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./database/index.js";



dotenv.config({ 
    path: "./.env"
});

const PORT = process.env.PORT || 8000





await connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
});
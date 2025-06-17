import dotenv from "dotenv";
import { app } from "./app.js";



dotenv.config({ 
    path: "./.env"
});

const PORT = process.env.PORT || 8000





app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
});
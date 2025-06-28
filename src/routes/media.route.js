import { Router } from "express";
import upload from "../utils/multer.js";
import { uploadMediaToCloudinary } from "../utils/cloudinary.js";



const router = Router();



router.route("/upload-video").post(upload.single("file"), async(req, res) => {
    try {

        const result = await uploadMediaToCloudinary(req.file.path);


        res.status(200).json({
            data: result,
            message: "File uploaded successfully.",
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error uploading file" })
    }
});



export default router;
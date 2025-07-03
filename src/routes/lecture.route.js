import { Router } from "express";
import { isAuthenticated, restrictTo } from "../middleware/auth.middleware.js";
import {
    createLecture,
    getCourseLectures,
    getSingleLecture,
    updateLecture,
    toggleLecturePreviewStatus,
    deleteLecture,
} from "../controllers/lecture.controller.js";
import { 
    validateCreateLectureInput,
    validateGetCourseLecturesParams,
    validateLectureParam,
    validateUpdateLectureInput,
} from "../middleware/validation.middleware.js";
import { isAuthenticated, restrictTo } from "../middleware/auth.middleware.js";
import upload from "../utils/multer.js";



const router = Router();
router.use(isAuthenticated);





router
  .route("/")
  .post(restrictTo("instructor"), upload.single("video"), validateCreateLectureInput, createLecture)
  .get(validateGetCourseLecturesParams, getCourseLectures);


router.route("/:lectureId/toggle-preview")
  .patch(restrictTo("instructor"), validateLectureParam, toggleLecturePreviewStatus);


router
  .route("/:lectureId")
  .get(validateLectureParam, getSingleLecture)
  .patch(restrictTo("instructor"), upload.single("video"), validateUpdateLectureInput, updateLecture)
  .delete(restrictTo("instructor"), validateLectureParam, deleteLecture);





export default router;
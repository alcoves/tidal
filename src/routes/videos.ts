import express from 'express'
import { createMultipartUpload } from '../controllers/createMultipartUpload'
import { completeMultipartUpload } from '../controllers/completeMultipartUpload'
import { createVideo } from '../controllers/createVideo'
import { uploadVideo } from '../controllers/uploadVideo'

const router = express.Router()

/**
 * Get Video
 * Update Video
 * Delete Video
 * Get Video Heatmap
 * Get Video Statistics
 * Reencode Video
 * List Videos
 * Set Thumbnail
 * Add Caption
 * Delete Caption
 */

// Creates a video entry
router.post('/', createVideo)

// Uploads a video via a direct PUT into object storage
router.put('/:videoId/upload', uploadVideo)

// Creates a multipart upload
router.post('/:videoId/multipart-upload', createMultipartUpload)

// Completes a multipart upload
router.put('/:videoId/multipart-upload', completeMultipartUpload)

// Updates a video
// router.patch('/:videoId', patchVideo)

// Deletes a video
// router.delete('/:videoId', deleteVideo)

export default router

import express from 'express'
import { createVideo } from '../controllers/createVideo'
import { reencodeVideo } from '../controllers/reencode'
import { createMultipartUpload } from '../controllers/createMultipartUpload'
import { completeMultipartUpload } from '../controllers/completeMultipartUpload'

const router = express.Router()

/**
 * Get Video
 * Get Video Heatmap
 * Get Video Statistics
 * List Videos
 * Set Thumbnail
 * Add Caption
 * Delete Caption
 */

// Creates a video entry
router.post('/', createVideo)

// Creates a multipart upload
router.post('/:videoId/multipart-upload', createMultipartUpload)

// Completes a multipart upload
router.put('/:videoId/multipart-upload', completeMultipartUpload)

// Reencodes the video
router.post('/:videoId/reencode', reencodeVideo)

// Updates a video
// router.patch('/:videoId', patchVideo)

// Deletes a video
// router.delete('/:videoId', deleteVideo)

export default router

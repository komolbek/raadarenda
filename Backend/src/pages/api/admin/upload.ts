import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { uploadImage } from '@/lib/upload/cloudinary'
import { requireAdminAuth } from '@/lib/auth/admin-middleware'
import { createTranslator } from '@/lib/i18n'
import fs from 'fs'

// Disable body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const t = createTranslator(req)

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: t('methodNotAllowed'),
    })
  }

  try {
    // Parse form data
    const form = formidable({
      maxFiles: 5,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filter: ({ mimetype }) => {
        return mimetype ? mimetype.includes('image') : false
      },
    })

    const [fields, files] = await form.parse(req)

    // Get folder from fields or use default
    const folder = (fields.folder?.[0] as string) || 'raadarenda/products'

    // Handle single file or multiple files
    const uploadedFiles = files.file || files.files || []
    const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles]

    if (fileArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      })
    }

    // Upload all files to Cloudinary
    const uploadPromises = fileArray.map(async (file) => {
      try {
        const result = await uploadImage(file.filepath, folder)
        // Clean up temp file
        fs.unlink(file.filepath, () => {})
        return result
      } catch (error) {
        fs.unlink(file.filepath, () => {})
        throw error
      }
    })

    const results = await Promise.all(uploadPromises)

    return res.status(200).json({
      success: true,
      data: results.length === 1 ? results[0] : results,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({
      success: false,
      message: t('internalServerError'),
    })
  }
}

export default requireAdminAuth(handler)

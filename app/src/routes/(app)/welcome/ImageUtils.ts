import sharp from 'sharp'

export const enum ImageValidationError {
	INVALID_IMAGE,
	NOT_SUPPORTED_FORMAT,
}

class ImageUtils {
	static applyExifRotation(image: sharp.Sharp) {
		image.rotate()
	}

	static async validateUserImageFormatFromBuffer(buffer: ArrayBuffer, animated: boolean) {
		let metadata: sharp.Metadata
		let imageInstance: sharp.Sharp

		try {
			imageInstance = sharp(buffer, {
				animated: animated,
			})
			/** Validates if it's actually a valid image and gets its metadata. */
			metadata = await imageInstance.metadata()
		} catch (error) {
			return ImageValidationError.INVALID_IMAGE
		}

		switch (metadata.format) {
			case 'png':
			case 'jpg':
			case 'jpeg':
			case 'gif':
			case 'webp':
				break
			default: {
				return ImageValidationError.NOT_SUPPORTED_FORMAT
			}
		}

		return imageInstance
	}

	static convertAndCompressImageIntoNormalizedFormat(image: sharp.Sharp) {
		return image.webp({ quality: 80 })
			.toBuffer()
	}
}

export default ImageUtils

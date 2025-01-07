// src/utils/compressImage.ts
import Compressor from 'compressorjs';

/**
 * 压缩图片文件
 * @param {File} file - 原始图片文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<File>} - 压缩后的图片文件
 */
export const compressImage = (file: File, options: any = {}) => {
  return new Promise<File>((resolve, reject) => {
    new Compressor(file, {
      quality: options.quality || 0.5,       // 压缩质量，默认0.5
      maxWidth: options.maxWidth || 800,     // 最大宽度，默认800
      maxHeight: options.maxHeight || 800,   // 最大高度，默认800
      convertSize: options.convertSize || 500 * 1024, // 转换为JPEG的阈值，单位字节，默认500KB
      convertTypes: ['image/png'],            // 将PNG转换为JPEG
      success(result: any) {
        resolve(result);
      },
      error(err) {
        reject(err);
      },
    });
  });
};

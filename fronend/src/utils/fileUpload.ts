import { Platform } from 'react-native';

export interface FileAssetInput {
  uri: string;
  name?: string | null;
  type?: string | null;
  file?: any; // File object thực sự từ Web (expo-image-picker trên browser)
}

/**
 * Thêm file ảnh vào FormData hỗ trợ tương thích 100% cho cả Web (PC/Browser) và Mobile (React Native Native).
 * 
 * - Trên Mobile (Android/iOS): React Native polyfill hỗ trợ object dạng { uri, name, type }.
 * - Trên Web (Browser): Trình duyệt không hiểu { uri, name, type } và sẽ chuyển thành chuỗi "[object Object]".
 *   Do đó trên Web cần truyền trực tiếp đối tượng File hoặc Blob để backend (Multer) nhận được file nhị phân.
 */
export async function appendImageToFormData(
  formData: FormData,
  fieldName: string,
  asset: FileAssetInput
): Promise<void> {
  const filename = asset.name || asset.uri.split('/').pop() || 'upload.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = asset.type || (match ? `image/${match[1].toLowerCase()}` : 'image/jpeg');

  if (Platform.OS === 'web') {
    // Nếu có đối tượng File/Blob từ expo-image-picker trên Web
    if (asset.file && (asset.file instanceof Blob || typeof asset.file === 'object')) {
      formData.append(fieldName, asset.file, filename);
      return;
    }

    // Nếu chỉ có uri (blob: http://... hoặc data:image/...), fetch về dạng Blob
    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      formData.append(fieldName, blob, filename);
    } catch (error) {
      console.error('Lỗi chuyển đổi URI sang Blob trên Web:', error);
      // Fallback
      formData.append(fieldName, {
        uri: asset.uri,
        name: filename,
        type,
      } as any);
    }
  } else {
    // Trên React Native Mobile
    formData.append(fieldName, {
      uri: asset.uri,
      name: filename,
      type,
    } as any);
  }
}

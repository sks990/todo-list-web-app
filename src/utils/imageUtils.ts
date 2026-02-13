/**
 * 이미지 URL을 Base64 문자열로 변환하여 파일 고립성을 강화합니다.
 */
export const convertImageToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Base64 conversion failed', error);
    return url;
  }
};
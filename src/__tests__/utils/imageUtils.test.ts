import { convertImageToBase64 } from '../../utils/imageUtils';

describe('imageUtils 테스트', () => {
  test('이미지 URL을 Base64로 변환해야 한다', async () => {
    const mockBlob = new Blob(['dummy content'], { type: 'image/png' });
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        blob: () => Promise.resolve(mockBlob),
      })
    );

    const result = await convertImageToBase64('http://example.com/image.png');
    expect(result).toContain('data:image/png;base64');
  });
});
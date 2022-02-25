/**
*  Constraints para video
*/
export const CONSTRAINT = {
  audio: false,
  video: {
    facingMode: 'user',
    height: { min: 640, ideal: 1280, max: 1920 },
    width: { min: 480, ideal: 720, max: 1080 },
  },
};

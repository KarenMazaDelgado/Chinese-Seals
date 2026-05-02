const onxrloaded = () => {
  XR8.XrController.configure({
    imageTargetData: [
      require('../image-targets/stamp1/stamp1.json'),
      require('../image-targets/stamp1irl/stamp1irl.json'),
      require('../image-targets/stamp2/stamp2.json'),
      require('../image-targets/stamp2irl/stamp2irl.json'),
      require('../image-targets/stamp3/stamp3.json'),
      require('../image-targets/stamp3irl/stamp3irl.json'),
      require('../image-targets/stamp4/stamp4.json'),
      require('../image-targets/stamp4irl/stamp4irl.json'),
      require('../image-targets/stamp5/stamp5.json'),
      require('../image-targets/stamp5irl/stamp5irl.json'),
    ],
  })
}
window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)


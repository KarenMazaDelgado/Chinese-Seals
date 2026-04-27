const onxrloaded = () => {
  XR8.XrController.configure({
    imageTargetData: [
      require('../image-targets/stamp1/stamp1.json'),
      require('../image-targets/stamp2/stamp2.json'),
      require('../image-targets/stamp3/stamp3.json'),
      require('../image-targets/stamp4/stamp4.json'),
      require('../image-targets/stamp5/stamp5.json'),
    ],
  })
}
window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded)


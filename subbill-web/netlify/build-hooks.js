// netlify/build-hooks.js
exports.onPreBuild = () => {
  console.log('빌드 전 준비 작업을 수행합니다...');
};

exports.onBuild = () => {
  console.log('빌드 중입니다...');
};

exports.onPostBuild = () => {
  console.log('빌드 완료! 후처리 작업을 수행합니다...');
};

exports.onSuccess = () => {
  console.log('배포가 성공적으로 완료되었습니다!');
};

exports.onError = () => {
  console.error('빌드 또는 배포 중 오류가 발생했습니다.');
};

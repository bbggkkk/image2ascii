import './imageToAscii/app.js';
import './imageToAscii/control.js';

function updateBodyClass() {
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.body.classList.toggle('dark', isDarkMode);
  document.body.classList.toggle('light', !isDarkMode);
}

// 초기 로드 시 클래스 설정
updateBodyClass();
// 모드 변경 시 클래스 업데이트
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateBodyClass);

interface ImageToAsciiConfig {
    resolution: number; // 최소 1
    colorMode: 'monochrome' | 'grayscale' | 'color-4' | 'color-8' | 'color-16' | 'color-24'; // 단색, 흑백, 4비트, 8비트, 16비트, 24비트
    monochromeColor: string; // CSS 색상
    chars: string;
}

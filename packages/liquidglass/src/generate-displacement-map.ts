export interface MapOptions {
  width: number;
  height: number;
  radius?: number;
  edgeSize?: number;
  intensity?: number;
  distortion?: number;
}

const VERT = `attribute vec4 position; void main(){ gl_Position = position; }`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uRadius;
uniform float uEdgeSize;
uniform float uIntensity;
uniform float uDistortion;

float sdRoundedBox(vec2 p, vec2 b, float r){
  r = min(r, min(b.x, b.y));
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float getHeight(vec2 p) {
    vec2 halfSize = uRes * 0.5 - 2.0;

    // Aumenta o tamanho base do box ligeiramente proporcinal ao edge
    halfSize += uEdgeSize * 0.2;

    float d = sdRoundedBox(p, halfSize, uRadius);

    float borderSoftness = uEdgeSize * uIntensity;
    d = max(d, -borderSoftness);
    return smoothstep(0.0, -borderSoftness, d);
}

void main(){
  vec2 p = gl_FragCoord.xy - uRes * 0.5;
  p.y = -p.y;

  // --- Displacement Map ---
  const vec2 e = vec2(1.0, 0.0);
  float hx = getHeight(p + e.xy) - getHeight(p - e.xy);
  float hy = getHeight(p + e.yx) - getHeight(p - e.yx);

  vec2 normal = vec2(-hx, -hy) * uDistortion;
  vec2 color = clamp(normal * 0.5 + 0.5, 0.0, 1.0);

  gl_FragColor = vec4(color.x, color.y, 0.5, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

let _cachedProgram: { gl: WebGLRenderingContext; program: WebGLProgram; canvas: HTMLCanvasElement } | null = null;

function getGL() {
  if (_cachedProgram) return _cachedProgram;

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, premultipliedAlpha: false })!;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  _cachedProgram = { gl, program, canvas };
  return _cachedProgram;
}

function render(width: number, height: number, radius: number, edgeSize: number, intensity: number, distortion: number): string {
  const { gl, program, canvas } = getGL();
  canvas.width = width;
  canvas.height = height;
  gl.viewport(0, 0, width, height);
  gl.clearColor(0.5, 0.5, 0.5, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  gl.uniform2f(gl.getUniformLocation(program, "uRes"), width, height);
  gl.uniform1f(gl.getUniformLocation(program, "uRadius"), radius);
  gl.uniform1f(gl.getUniformLocation(program, "uEdgeSize"), edgeSize);
  gl.uniform1f(gl.getUniformLocation(program, "uIntensity"), intensity);
  gl.uniform1f(gl.getUniformLocation(program, "uDistortion"), distortion);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  return canvas.toDataURL("image/png");
}

export function generateGlassMaps(opts: MapOptions): { displacement: string } {
  const { width, height, radius = 60, edgeSize = 40, intensity = 1.0, distortion = 15.0 } = opts;
  const r = Math.min(radius, width / 2, height / 2);

  return {
    displacement: render(width, height, r, edgeSize, intensity, distortion),
  };
}

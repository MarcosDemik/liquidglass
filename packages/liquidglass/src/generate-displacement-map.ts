export interface MapOptions {
  width: number;
  height: number;
  radius?: number;
  edgeSize?: number;
  intensity?: number;
  specularWidth?: number;
}

const VERT = `attribute vec4 position; void main(){ gl_Position = position; }`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uRadius;
uniform float uBorderSoftness;
uniform float uSpecularWidth;
uniform int uMode; // 0 = displacement, 1 = specular

float sdRoundedBox(vec2 p, vec2 b, float r){
  r = min(r, min(b.x, b.y));
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec3 calcNormal(vec2 p, vec2 b, float r){
  const float e = 1.0;
  vec2 h = vec2(e, 0.0);
  return normalize(vec3(
    sdRoundedBox(p+h.xy, b, r) - sdRoundedBox(p-h.xy, b, r),
    sdRoundedBox(p+h.yx, b, r) - sdRoundedBox(p-h.yx, b, r),
    -e * 2.0
  ));
}

void main(){
  vec2 p = gl_FragCoord.xy - uRes * 0.5;
  vec2 halfSize = uRes * 0.5 - 1.0;
  float d = sdRoundedBox(p, halfSize, uRadius);

  if(d > 0.0){ gl_FragColor = vec4(0.0); return; }

  if(uMode == 0){
    vec3 n = calcNormal(p, halfSize, uRadius);
    vec3 nc = n * 0.5 + 0.5;
    float border = smoothstep(-uBorderSoftness, 0.0, d);
    vec3 flat_ = vec3(0.5, 0.5, 1.0);
    gl_FragColor = vec4(mix(flat_, nc, border), 1.0);
  } else {
    float rim = smoothstep(-uSpecularWidth - 2.0, -uSpecularWidth, d)
              * (1.0 - smoothstep(-2.0, 0.0, d));
    float glow = smoothstep(-uBorderSoftness, 0.0, d) * 0.1;
    float s = clamp(rim + glow, 0.0, 1.0);
    gl_FragColor = vec4(vec3(s), s);
  }
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

function render(
  width: number,
  height: number,
  radius: number,
  borderSoftness: number,
  specularWidth: number,
  mode: number,
): string {
  const { gl, program, canvas } = getGL();
  canvas.width = width;
  canvas.height = height;
  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  gl.uniform2f(gl.getUniformLocation(program, "uRes"), width, height);
  gl.uniform1f(gl.getUniformLocation(program, "uRadius"), radius);
  gl.uniform1f(gl.getUniformLocation(program, "uBorderSoftness"), borderSoftness);
  gl.uniform1f(gl.getUniformLocation(program, "uSpecularWidth"), specularWidth);
  gl.uniform1i(gl.getUniformLocation(program, "uMode"), mode);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  return canvas.toDataURL("image/png");
}

export function generateGlassMaps(opts: MapOptions): {
  displacement: string;
  specular: string;
} {
  const {
    width,
    height,
    radius = 60,
    edgeSize = 30,
    intensity = 0.7,
    specularWidth = 0.02,
  } = opts;

  const r = Math.min(radius, width / 2, height / 2);
  const borderSoftness = edgeSize * intensity;
  const specPx = specularWidth * Math.min(width, height);

  return {
    displacement: render(width, height, r, borderSoftness, specPx, 0),
    specular: render(width, height, r, borderSoftness, specPx, 1),
  };
}

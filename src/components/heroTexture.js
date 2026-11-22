const vertexSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * .5 + .5;
    gl_Position = vec4(a_position, 0., 1.);
  }
`;

// Real-time materials: cursor distortion and tap ripples stay inside the hero.
const fragmentSource = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  varying vec2 v_uv;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_pointer;
  uniform vec3 u_ripple;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  void main() {
    vec2 uv = v_uv;
    float edge = smoothstep(.1, .5, abs(uv.x - .5));
    float bottomFade = smoothstep(0., .3, uv.y);
    vec3 paper = mix(vec3(1.), vec3(.9843137, .9882353, 1.), bottomFade);
    if (edge < .002) { gl_FragColor = vec4(paper, 1.); return; }

    float aspect = u_resolution.x / max(u_resolution.y, 1.);
    vec2 p = uv * vec2(aspect, 1.) * 1.55;
    vec2 delta = (uv - u_pointer.xy) * vec2(aspect, 1.);
    float distanceToPointer = length(delta);
    float influence = exp(-distanceToPointer * distanceToPointer * 9.) * u_pointer.z;
    p += delta * influence * .45;
    p += vec2(sin(distanceToPointer * 22. - u_time * 2.), cos(distanceToPointer * 17. - u_time * 1.5)) * influence * .065;

    vec2 clickDelta = (uv - u_ripple.xy) * vec2(aspect, 1.);
    float radius = length(clickDelta);
    float wave = sin(radius * 38. - u_ripple.z * 5.) * exp(-abs(radius - u_ripple.z * .14) * 10.) * exp(-u_ripple.z * .7);
    p += clickDelta / max(radius, .001) * wave * .06;

    float t = u_time * .13;
    vec2 q = p * 2.3;
    q += vec2(sin(q.y * 2. + t), cos(q.x * 1.8 - t)) * .35;
    float a = sin(q.x * 4. + sin(q.y * 3.2 + t)) + sin(q.y * 4.5 + sin(q.x * 3. - t));
    float b = sin(q.x * 3.2 - q.y * 2.8 + t * .7);
    float caustic = pow(1. - min(abs(a), 1.), 5.);
    float second = pow(max(0., 1. - abs(b)), 10.) * .25;
    vec3 color = mix(vec3(.36, .65, .93), vec3(.67, .86, .99), .5 + .5 * sin(q.y + t));
    color += (caustic + second) * vec3(.25, .21, .12);
    color += (hash(gl_FragCoord.xy) - .5) * .012;
    float corner = uv.x < .5 ? uv.y : 1. - uv.y;
    float amount = .52 * edge * bottomFade * (.52 + .48 * smoothstep(.05, .95, corner));
    // Composite the pale water and its fade once, inside the shader. Safari
    // doesn't need to combine a transparent GPU surface with CSS masks/opacity.
    gl_FragColor = vec4(mix(paper, clamp(color, 0., 1.), amount), 1.);
  }
`;

export function createHeroTexture(canvas) {
  const gl = canvas.getContext("webgl", {
    alpha: false, antialias: false, depth: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const shaders = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const dispose = () => {
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
  };
  for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]]) {
    const shader = gl.createShader(type);
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      dispose();
      return null;
    }
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    dispose();
    return null;
  }
  gl.useProgram(program);
  gl.clearColor(251 / 255, 252 / 255, 1, 1);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // One oversized triangle avoids a shared diagonal edge on mobile GPUs.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = Object.fromEntries(["resolution", "time", "pointer", "ripple"].map((name) => [name, gl.getUniformLocation(program, `u_${name}`)]));

  return {
    resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        // Resizing clears an opaque canvas to black unless we repaint it now.
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    },
    render({ time, pointer, ripple }) {
      if (gl.isContextLost()) return;
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, time);
      gl.uniform3fv(uniforms.pointer, pointer);
      gl.uniform3fv(uniforms.ripple, ripple);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose,
  };
}

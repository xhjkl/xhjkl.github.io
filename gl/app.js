(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // tool.gl/source/client/dom.js
  var require_dom = __commonJS({
    "tool.gl/source/client/dom.js"(exports, module) {
      function dropScript(source) {
        return new Promise();
      }
      function defile() {
        Array.prototype.forEach.call(
          document.querySelectorAll("*[pristine]"),
          (each) => each.removeAttribute("pristine")
        );
      }
      module.exports = { dropScript, defile };
    }
  });

  // tool.gl/source/client/node.js
  var require_node = __commonJS({
    "tool.gl/source/client/node.js"(exports, module) {
      module.exports = (tag, attrs, content) => {
        attrs = attrs || {};
        content = content || [];
        const element = document.createElement(tag);
        Object.keys(attrs).forEach((key) => {
          element.setAttribute(key, attrs[key]);
        });
        if (Array.isArray(content)) {
          content.forEach((child) => {
            element.appendChild(child);
          });
        } else {
          element.textContent = content;
        }
        return element;
      };
    }
  });

  // tool.gl/source/client/dash.js
  var require_dash = __commonJS({
    "tool.gl/source/client/dash.js"(exports, module) {
      var node = require_node();
      function Dash(scope) {
        if (!(this instanceof Dash)) {
          throw TypeError("constructor Dash requires `new`");
        }
        this.scope = scope;
        const loginCurtain = node("login", {}, [
          node("main", {}, [
            node("div", {}, [
              node("span", {}, "prompt#1"),
              node("label", {}, "email"),
              node("input", { type: "email" }, [])
            ]),
            node("div", {}, [
              node("span", {}, "prompt#2"),
              node("label", {}, "secret"),
              node("input", { type: "password" }, [])
            ]),
            node("div", {}, [
              node("span", {}, "prompt#3"),
              node("label", {}, "secret"),
              node("input", { type: "password" }, [])
            ])
          ])
        ]);
        this.openKeyInputPane = loginCurtain.querySelector(
          "div:nth-of-type(1)"
        );
        this.closedKeyInputPane = loginCurtain.querySelector(
          "div:nth-of-type(2)"
        );
        this.closedKeyConfirmationPane = loginCurtain.querySelector(
          "div:nth-of-type(3)"
        );
        this.openKeyControl = this.openKeyInputPane.querySelector("input");
        this.closedKeyControl = this.closedKeyInputPane.querySelector("input");
        this.closedKeyConfirmationControl = this.closedKeyConfirmationPane.querySelector("input");
        this.firstPrompt = this.openKeyInputPane.querySelector(
          "span"
        );
        this.secondPrompt = this.closedKeyInputPane.querySelector(
          "span"
        );
        this.thirdPrompt = this.closedKeyConfirmationPane.querySelector(
          "span"
        );
        this.offsetBearer = this.openKeyInputPane;
        this.step = 0;
        this.lastStep = 1;
        this.readyToSumbit = false;
        this.firstPrompt.textContent = "You need to be logged in to edit this";
        Array.prototype.forEach.call(
          loginCurtain.querySelectorAll("input"),
          (element) => {
            element.addEventListener(
              "keyup",
              this.handleInput.bind(this)
            );
          }
        );
        if (true || self.localStorage.getItem("at") != null) {
          loginCurtain.style.display = "none";
        }
        // scope.appendChild(loginCurtain);
      }
      Dash.prototype.get = function() {
        const user = {};
        user.email = this.openKeyControl.value;
        user.secret = this.closedKeyControl.value;
        return user;
      };
      Dash.prototype.check = function() {
        fetch("/user/check", {
          method: "POST",
          body: JSON.stringify(this.get()),
          credentials: "omit"
        }).then((re) => re.json()).then((user) => {
          if (user.exists) {
            this.lastStep = 1;
            this.secondPrompt.textContent = "Welcome back";
          } else {
            this.lastStep = 2;
            this.secondPrompt.textContent = "Signing in as a new user";
            this.thirdPrompt.textContent = "Same secret again";
          }
          this.readyToSumbit = true;
        });
      };
      Dash.prototype.advance = function() {
        if (this.step == this.lastStep) {
          return this.submit();
        }
        if (this.step == 0) {
          this.check();
        }
        this.step += 1;
        this.offsetBearer.style.marginLeft = `-${this.step * 100}%`;
      };
      Dash.prototype.recede = function() {
        if (this.step === 0) {
          return;
        }
        this.step -= 1;
        offsetBearer.style.marginLeft = `-${this.step * 100}%`;
      };
      Dash.prototype.submit = function() {
        if (!this.readyToSumbit) {
          return;
        }
        const user = this.get();
        if (this.step > 1) {
          if (user.secret !== this.closedKeyConfirmationControl.value) {
            return;
          }
          this.create(user);
        } else {
          this.auth(user);
        }
      };
      Dash.prototype.create = function(user) {
        fetch("/user/create", {
          method: "POST",
          body: JSON.stringify(user),
          credentials: "omit"
        }).then((re) => re.json()).then((re) => {
          if (re.success) {
            this.auth(user);
          }
        }).catch((error) => {
          console.error(error);
        });
      };
      Dash.prototype.auth = function(user) {
        fetch("/user/auth", {
          method: "POST",
          body: JSON.stringify(user),
          credentials: "omit"
        }).then((re) => re.json()).then((re) => {
          if (re.success && re.token) {
            self.localStorage.setItem("at", re.token);
            self.location.href = self.location.href;
          } else {
            console.error(re);
          }
        }).catch((error) => {
          console.error(error);
        });
      };
      Dash.prototype.handleInput = function(ev) {
        if (ev.key === "Enter") {
          this.advance();
        }
      };
      module.exports.attach = (scope) => new Dash(scope);
    }
  });

  // tool.gl/source/client/shade.js
  var require_shade = __commonJS({
    "tool.gl/source/client/shade.js"(exports, module) {
      var passThroughVertexShaderSource = [
        "attribute vec2 position;",
        "varying vec2 Position;",
        "void main()",
        "{ gl_Position = vec4((Position = position), 0.0, 1.0); }"
      ].join("");
      var passThroughFragmentShaderSource = [
        "uniform sampler2D texture;",
        "uniform mediump vec2 Resolution;",
        "void main() { gl_FragColor = texture2D(",
        "texture, gl_FragCoord.xy / Resolution); }"
      ].join("");
      function Shade(gl) {
        if (!(this instanceof Shade)) {
          throw TypeError("constructor Shade requires `new`");
        }
        this.gl = gl;
        this.width = 0;
        this.height = 0;
        this.unitQuadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.unitQuadBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([
            1,
            -1,
            -1,
            -1,
            1,
            1,
            -1,
            1
          ]),
          gl.STATIC_DRAW
        );
        this.evenFrame = gl.createTexture();
        this.oddFrame = gl.createTexture();
        [this.evenFrame, this.oddFrame].forEach((texture) => {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_WRAP_S,
            gl.CLAMP_TO_EDGE
          );
          gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_WRAP_T,
            gl.CLAMP_TO_EDGE
          );
          gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MIN_FILTER,
            gl.NEAREST
          );
          gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MAG_FILTER,
            gl.NEAREST
          );
        });
        this.evenFramebuffer = gl.createFramebuffer();
        this.oddFramebuffer = gl.createFramebuffer();
        [this.evenFramebuffer, this.oddFramebuffer].forEach((fb, i) => {
          gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
          gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            [this.evenFrame, this.oddFrame][i],
            0
          );
        });
        this.prog = 0;
        this.frag = 0;
        this.vert = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vert, passThroughVertexShaderSource);
        gl.compileShader(this.vert);
        if (!gl.getShaderParameter(this.vert, gl.COMPILE_STATUS)) {
          throw Error(
            "vertex shader failed to compile: " + gl.getShaderInfoLog(this.vert)
          );
        }
        const passOnFrag = gl.createShader(gl.FRAGMENT_SHADER);
        this.passOn = gl.createProgram();
        gl.shaderSource(passOnFrag, passThroughFragmentShaderSource);
        gl.compileShader(passOnFrag);
        if (!gl.getShaderParameter(passOnFrag, gl.COMPILE_STATUS)) {
          throw Error(
            "pass-on shader failed to compile: " + gl.getShaderInfoLog(passOnFrag)
          );
        }
        gl.attachShader(this.passOn, this.vert);
        gl.attachShader(this.passOn, passOnFrag);
        gl.linkProgram(this.passOn);
        if (!gl.getProgramParameter(this.passOn, gl.LINK_STATUS)) {
          throw Error(
            "pass-on program failed to link: " + gl.getProgramInfoLog(this.passOn)
          );
        }
        this.frameCount = 0;
        this.timeUniform = 0;
        this.resolutionUniform = 0;
        this.passOnResolutionUniform = gl.getUniformLocation(
          this.passOn,
          "Resolution"
        );
        gl.clearColor(0, 0, 0, 0);
        return this;
      }
      Shade.prototype.useSource = function(source, fail) {
        const gl = this.gl;
        const newProg = gl.createProgram();
        const newFrag = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(newFrag, source);
        gl.compileShader(newFrag);
        if (!gl.getShaderParameter(newFrag, gl.COMPILE_STATUS)) {
          fail(gl.getShaderInfoLog(newFrag));
          return;
        }
        gl.attachShader(newProg, this.vert);
        gl.attachShader(newProg, newFrag);
        gl.linkProgram(newProg);
        if (!gl.getProgramParameter(newProg, gl.LINK_STATUS)) {
          fail(gl.getProgramInfoLog(newProg));
          return;
        }
        if (this.prog) {
        }
        this.prog = newProg;
        this.frag = newFrag;
        this.timeUniform = gl.getUniformLocation(this.prog, "Time");
        this.resolutionUniform = gl.getUniformLocation(
          this.prog,
          "Resolution"
        );
        const attr = gl.getAttribLocation(this.prog, "position");
        gl.enableVertexAttribArray(attr);
        gl.vertexAttribPointer(
          attr,
          2,
          gl.FLOAT,
          false,
          2 * Float32Array.BYTES_PER_ELEMENT,
          0
        );
      };
      Shade.prototype.adjust = function(width, height) {
        if (width == this.width && height == this.height) {
          return;
        }
        const gl = this.gl;
        [this.evenFrame, this.oddFrame].forEach((texture) => {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            width,
            height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
          );
        });
        gl.viewport(0, 0, width, height);
        this.width = width;
        this.height = height;
      };
      Shade.prototype.render = function(timestamp) {
        const gl = this.gl;
        this.adjust(gl.canvas.clientWidth, gl.canvas.clientHeight);
        const odd = this.frameCount & 1;
        const target = odd ? this.oddFramebuffer : this.evenFramebuffer;
        const targetTexture = odd ? this.oddFrame : this.evenFrame;
        const sourceTexture = odd ? this.evenFrame : this.oddFrame;
        gl.bindFramebuffer(gl.FRAMEBUFFER, target);
        gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
        gl.useProgram(this.prog);
        gl.uniform1f(this.timeUniform, timestamp);
        gl.uniform2f(
          this.resolutionUniform,
          gl.canvas.clientWidth,
          gl.canvas.clientHeight
        );
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        gl.useProgram(this.passOn);
        gl.uniform2f(
          this.passOnResolutionUniform,
          gl.canvas.clientWidth,
          gl.canvas.clientHeight
        );
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        this.frameCount += 1;
      };
      module.exports = Shade;
    }
  });

  // tool.gl/source/client/editor.js
  var require_editor = __commonJS({
    "tool.gl/source/client/editor.js"(exports, module) {
      var aceCoreSource = "//cdnjs.cloudflare.com/ajax/libs/ace/1.2.2/ace.js";
      var modeExtSource = "//cdnjs.cloudflare.com/ajax/libs/ace/1.2.2/mode-glsl.js";
      function edit(element) {
        return new Promise((resolve, reject) => {
          var coreScript = document.createElement("script");
          coreScript.onload = resolve;
          coreScript.onerror = reject;
          coreScript.src = aceCoreSource;
          document.head.appendChild(coreScript);
        }).then(() => new Promise((resolve, reject) => {
          var modeScript = document.createElement("script");
          modeScript.onload = resolve;
          modeScript.onerror = reject;
          modeScript.src = modeExtSource;
          document.head.appendChild(modeScript);
        })).then(() => self.ace.edit(element)).catch(() => {
          console.error("could not load Ace");
        });
      }
      function read(editor) {
        return editor.getValue();
      }
      function focus(editor) {
        editor.focus();
        return editor;
      }
      function configure(editor) {
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/glsl");
        return editor;
      }
      function readonly(editor) {
        editor.setReadOnly(true);
        return editor;
      }
      function readwrite(editor) {
        editor.setReadOnly(false);
        return editor;
      }
      function change(editor, callback) {
        editor.on("change", callback.bind(editor));
        return editor;
      }
      function boilerplate(editor, content) {
        const Range = self.require("ace/range").Range;
        const session = editor.getSession();
        function preventFromEditing(range2) {
          return function(data, hash, keyString, keyCode, event) {
            if (hash === -1 || 37 <= keyCode && keyCode <= 40) {
              return;
            }
            const selection = editor.getSelectionRange();
            if (selection.intersects(range2)) {
              const start = selection.start;
              if (range2.isEnd(start.row, start.column)) {
                if ([8].indexOf(keyCode) === -1) {
                  return;
                }
              }
              return { command: "null", passEvent: false };
            }
          };
        }
        editor.$blockScrolling = Infinity;
        editor.setValue(content);
        const lines = session.getLength();
        const range = new Range(0, 0, lines, 0);
        editor.keyBinding.addKeyboardHandler({
          handleKeyboard: preventFromEditing(range)
        });
        const doOnPaste = editor.onPaste;
        editor.onPaste = function() {
          if (editor.getSelectionRange().intersects(range)) {
            return;
          }
          doOnPaste.apply(editor, arguments);
        };
        const doOnCut = editor.onCut;
        editor.onCut = function() {
          if (editor.getSelectionRange().intersects(range)) {
            return;
          }
          doOnCut.apply(editor, arguments);
        };
        session.addMarker(range, "boilerplate");
        return editor;
      }
      function preset(editor, content) {
        editor.setValue(editor.getValue() + "\n" + content);
        editor.find(";;");
        editor.replace("");
        return editor;
      }
      module.exports = {
        edit,
        configure,
        readonly,
        readwrite,
        change,
        boilerplate,
        preset,
        focus,
        read
      };
    }
  });

  // tool.gl/source/client/debounce.js
  var require_debounce = __commonJS({
    "tool.gl/source/client/debounce.js"(exports, module) {
      module.exports = function(milliseconds, callee) {
        var data = {
          timeoutId: null
        };
        const debounced = function() {
          clearTimeout(data.timeoutId);
          data.timeoutId = setTimeout(callee.bind(this), milliseconds);
        };
        return debounced;
      };
    }
  });

  // tool.gl/source/client/main.js
  (function() {
    const dom = require_dom();
    const dash = require_dash();
    const Shade = require_shade();
    const editor = require_editor();
    const debounce = require_debounce();
    const shaderInputs = [
      "uniform mediump float Time;",
      "uniform mediump vec2 Resolution;",
      "uniform sampler2D LastFrame;",
      "varying lowp vec2 Position;"
    ].join("\n");
    const shaderFramework = [
      "",
      "",
      "void main()",
      "{",
      "    mediump vec4 last_color = texture2D(",
      "        LastFrame, gl_FragCoord.xy / Resolution);",
      "",
      "    mediump float t = Time / 256.0;",
      "    mediump vec2 center = vec2(",
      "        0.8 * cos(t),",
      "        0.3 * sin(2.0 * t)",
      "    );",
      "    mediump vec2 cc = Position - center;",
      "    lowp float ct = smoothstep(",
      "        0.1, 0.11, pow(cc.x * 2.0, 2.0) + pow(cc.y, 2.0));",
      "",
      "    gl_FragColor = mix(",
      "        vec4(",
      "            sin(312.0 + pow(t / 128.0, 2.0)),",
      "            0.7,",
      "            sin(128.0 + t / 480.0),",
      "            1.0",
      "        ),",
      "        vec4(last_color.rgb, last_color.a * 0.991),",
      "        ct",
      "    );",
      "}",
      ""
    ].join("\n");
    addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("link");
      style.setAttribute("rel", "stylesheet");
      style.setAttribute("href", "rich.css");
      document.head.appendChild(style);
      const canvas = document.querySelector("canvas");
      const gl = canvas.getContext("webgl");
      const shade = new Shade(gl);
      const recompileShader = debounce(128, function(delta) {
        shade.useSource(
          this.getValue(),
          console.error.bind(console)
        );
      });
      const redraw = function(timestamp) {
        shade.render(timestamp);
        requestAnimationFrame(redraw);
      };
      dash.attach(document.body);
      editor.edit(
        document.querySelector("div[x-editable]")
      ).then(editor.readonly).then(editor.configure).then((field) => editor.boilerplate(field, shaderInputs)).then((field) => editor.preset(field, shaderFramework)).then((field) => {
        shade.useSource(
          field.getValue(),
          console.error.bind(console)
        );
        return editor.change(field, recompileShader);
      }).then(editor.readwrite).then(editor.focus).then(dom.defile).then(() => requestAnimationFrame(redraw));
    });
  })();
})();

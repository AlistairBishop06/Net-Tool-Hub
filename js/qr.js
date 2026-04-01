const qrInput = document.getElementById("qr-input");
const qrSize = document.getElementById("qr-size");
const qrCanvas = document.getElementById("qr-canvas");
const qrSvgContainer = document.getElementById("qr-svg");
const validation = document.querySelector("[data-validation]");
const actionButtons = document.querySelectorAll("[data-action]");

const VERSION_DATA = [
  { version: 1, size: 21, dataCodewords: 19, ecCodewords: 7, align: [] },
  { version: 2, size: 25, dataCodewords: 34, ecCodewords: 10, align: [6, 18] },
  { version: 3, size: 29, dataCodewords: 55, ecCodewords: 15, align: [6, 22] },
  { version: 4, size: 33, dataCodewords: 80, ecCodewords: 20, align: [6, 26] },
];

const GF = (() => {
  const exp = new Uint8Array(512);
  const log = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    exp[i] = x;
    log[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) exp[i] = exp[i - 255];
  return { exp, log };
})();

const gfMul = (a, b) => {
  if (a === 0 || b === 0) return 0;
  return GF.exp[GF.log[a] + GF.log[b]];
};

const rsGenerator = (degree) => {
  let poly = [1];
  for (let i = 0; i < degree; i += 1) {
    const next = [];
    for (let j = 0; j < poly.length; j += 1) {
      next[j] = (next[j] || 0) ^ gfMul(poly[j], GF.exp[i]);
    }
    next.push(0);
    for (let j = 0; j < poly.length; j += 1) {
      next[j + 1] = (next[j + 1] || 0) ^ poly[j];
    }
    poly = next;
  }
  return poly;
};

const rsEncode = (data, ecLength) => {
  const gen = rsGenerator(ecLength);
  const buffer = data.slice();
  buffer.push(...Array(ecLength).fill(0));
  for (let i = 0; i < data.length; i += 1) {
    const factor = buffer[i];
    if (factor !== 0) {
      for (let j = 0; j < gen.length; j += 1) {
        buffer[i + j] ^= gfMul(gen[j], factor);
      }
    }
  }
  return buffer.slice(buffer.length - ecLength);
};

const chooseVersion = (textLength) => {
  for (const v of VERSION_DATA) {
    if (textLength <= v.dataCodewords - 2) return v;
  }
  return null;
};

const buildDataCodewords = (text, versionInfo) => {
  const bytes = new TextEncoder().encode(text);
  const dataCapacity = versionInfo.dataCodewords;
  const bits = [];

  bits.push(0, 1, 0, 0);
  const lengthBits = versionInfo.version <= 9 ? 8 : 16;
  for (let i = lengthBits - 1; i >= 0; i -= 1) {
    bits.push((bytes.length >> i) & 1);
  }
  bytes.forEach((byte) => {
    for (let i = 7; i >= 0; i -= 1) bits.push((byte >> i) & 1);
  });
  for (let i = 0; i < 4; i += 1) bits.push(0);

  while (bits.length % 8 !== 0) bits.push(0);

  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let val = 0;
    for (let j = 0; j < 8; j += 1) {
      val = (val << 1) | bits[i + j];
    }
    codewords.push(val);
  }

  const padBytes = [0xec, 0x11];
  let padIndex = 0;
  while (codewords.length < dataCapacity) {
    codewords.push(padBytes[padIndex % 2]);
    padIndex += 1;
  }

  return codewords;
};

const createMatrix = (size) => {
  const matrix = Array.from({ length: size }, () => Array(size).fill(null));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));
  return { matrix, reserved };
};

const placeFinder = (matrix, reserved, row, col) => {
  for (let r = -1; r <= 7; r += 1) {
    for (let c = -1; c <= 7; c += 1) {
      const y = row + r;
      const x = col + c;
      if (y < 0 || x < 0 || y >= matrix.length || x >= matrix.length) continue;
      reserved[y][x] = true;
      if (r === -1 || r === 7 || c === -1 || c === 7) {
        matrix[y][x] = 0;
      } else if (r === 0 || r === 6 || c === 0 || c === 6) {
        matrix[y][x] = 1;
      } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
        matrix[y][x] = 1;
      } else {
        matrix[y][x] = 0;
      }
    }
  }
};

const placeAlignment = (matrix, reserved, row, col) => {
  for (let r = -2; r <= 2; r += 1) {
    for (let c = -2; c <= 2; c += 1) {
      const y = row + r;
      const x = col + c;
      reserved[y][x] = true;
      if (Math.max(Math.abs(r), Math.abs(c)) === 2) {
        matrix[y][x] = 1;
      } else if (r === 0 && c === 0) {
        matrix[y][x] = 1;
      } else {
        matrix[y][x] = 0;
      }
    }
  }
};

const placeTiming = (matrix, reserved) => {
  const size = matrix.length;
  for (let i = 8; i < size - 8; i += 1) {
    const bit = i % 2 === 0 ? 1 : 0;
    matrix[6][i] = bit;
    matrix[i][6] = bit;
    reserved[6][i] = true;
    reserved[i][6] = true;
  }
};

const placeFormatInfo = (matrix, reserved) => {
  const size = matrix.length;
  const format = 0b111011111000100;
  const bits = [];
  for (let i = 14; i >= 0; i -= 1) bits.push((format >> i) & 1);

  const coords = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ];

  coords.forEach(([r, c], i) => {
    matrix[r][c] = bits[i];
    reserved[r][c] = true;
  });

  const coords2 = [
    [size - 1, 8],
    [size - 2, 8],
    [size - 3, 8],
    [size - 4, 8],
    [size - 5, 8],
    [size - 6, 8],
    [size - 7, 8],
    [8, size - 8],
    [8, size - 7],
    [8, size - 6],
    [8, size - 5],
    [8, size - 4],
    [8, size - 3],
    [8, size - 2],
    [8, size - 1],
  ];

  coords2.forEach(([r, c], i) => {
    matrix[r][c] = bits[i];
    reserved[r][c] = true;
  });
};

const placeData = (matrix, reserved, dataBits) => {
  const size = matrix.length;
  let bitIndex = 0;
  let direction = -1;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1;
    for (let row = direction === -1 ? size - 1 : 0; row >= 0 && row < size; row += direction) {
      for (let c = 0; c < 2; c += 1) {
        const x = col - c;
        if (reserved[row][x]) continue;
        const bit = dataBits[bitIndex] || 0;
        const masked = ((row + x) % 2 === 0) ? bit ^ 1 : bit;
        matrix[row][x] = masked;
        bitIndex += 1;
      }
    }
    direction *= -1;
  }
};

const buildMatrix = (text) => {
  const versionInfo = chooseVersion(new TextEncoder().encode(text).length);
  if (!versionInfo) return { error: "Input too long for offline QR generation." };

  const dataCodewords = buildDataCodewords(text, versionInfo);
  const ecCodewords = rsEncode(dataCodewords, versionInfo.ecCodewords);
  const codewords = [...dataCodewords, ...ecCodewords];

  const bits = [];
  codewords.forEach((byte) => {
    for (let i = 7; i >= 0; i -= 1) bits.push((byte >> i) & 1);
  });

  const { matrix, reserved } = createMatrix(versionInfo.size);
  placeFinder(matrix, reserved, 0, 0);
  placeFinder(matrix, reserved, versionInfo.size - 7, 0);
  placeFinder(matrix, reserved, 0, versionInfo.size - 7);
  placeTiming(matrix, reserved);

  if (versionInfo.align.length) {
    versionInfo.align.forEach((row) => {
      versionInfo.align.forEach((col) => {
        if (
          (row === 6 && col === 6) ||
          (row === 6 && col === versionInfo.size - 7) ||
          (row === versionInfo.size - 7 && col === 6)
        ) {
          return;
        }
        placeAlignment(matrix, reserved, row, col);
      });
    });
  }

  matrix[versionInfo.size - 8][8] = 1;
  reserved[versionInfo.size - 8][8] = true;

  placeFormatInfo(matrix, reserved);
  placeData(matrix, reserved, bits);

  return { matrix, versionInfo };
};

const renderCanvas = (matrix, size) => {
  const moduleCount = matrix.length;
  const scale = Math.floor(size / moduleCount);
  const canvasSize = moduleCount * scale;
  qrCanvas.width = canvasSize;
  qrCanvas.height = canvasSize;
  const ctx = qrCanvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  ctx.fillStyle = "#000";
  matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) ctx.fillRect(x * scale, y * scale, scale, scale);
    });
  });
};

const renderSvg = (matrix, size) => {
  const moduleCount = matrix.length;
  const scale = Math.floor(size / moduleCount);
  const canvasSize = moduleCount * scale;
  let rects = "";
  matrix.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        rects += `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}"></rect>`;
      }
    });
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><g fill="#000">${rects}</g></svg>`;
  qrSvgContainer.textContent = svg;
  return svg;
};

const updateQr = () => {
  const text = qrInput.value.trim();
  if (!text) {
    validation.textContent = "";
    const ctx = qrCanvas.getContext("2d");
    ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
    qrSvgContainer.textContent = "";
    return;
  }

  const { matrix, error } = buildMatrix(text);
  if (error) {
    validation.textContent = error;
    return;
  }
  validation.textContent = "";
  const size = Number(qrSize.value);
  renderCanvas(matrix, size);
  renderSvg(matrix, size);

  const params = new URLSearchParams({ text, size: qrSize.value });
  history.replaceState(null, "", `${location.pathname}?${params.toString()}`);
};

const downloadFile = (data, filename, type) => {
  const blob = new Blob([data], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
};

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.getAttribute("data-action");
    if (action === "generate") updateQr();
    if (action === "png") {
      qrCanvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "toolhub-qr.png";
        link.click();
        URL.revokeObjectURL(link.href);
      });
    }
    if (action === "svg") {
      const svg = qrSvgContainer.textContent;
      if (svg) downloadFile(svg, "toolhub-qr.svg", "image/svg+xml");
    }
  });
});

qrInput.addEventListener("input", updateQr);
qrSize.addEventListener("change", updateQr);

const initFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const text = params.get("text");
  const size = params.get("size");
  if (text) qrInput.value = text;
  if (size) qrSize.value = size;
  if (text || size) updateQr();
};

initFromUrl();

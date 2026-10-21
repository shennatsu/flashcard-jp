import { fileURLToPath } from "node:url";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const ASCII_RAMP = " .:-=+*#%@";
const FRAME_REVEALS = [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 1] as const;
const FRAME_COLUMNS = 80;
const FRAME_ROWS = 32;
const SCENE_WIDTH = 320;
const SCENE_HEIGHT = 200;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const asciiDirectory = path.join(root, "public", "ascii");

type PixelBuffer = Buffer;

type FrameManifestEntry = {
  readonly file: string;
  readonly progress: number;
};

export type AsciiManifest = {
  readonly version: 1;
  readonly columns: number;
  readonly rows: number;
  readonly frames: readonly FrameManifestEntry[];
};

type CompositeSpec = {
  readonly file: string;
  readonly width: number;
  readonly left: number;
  readonly top: number;
};

const optimizedAssets = {
  paper: path.join(root, "public", "paper", "footer-paper@2x.webp"),
  grass: path.join(root, "public", "paper", "footer-grass@2x.webp"),
  folders: [
    "folder-01@2x.webp",
    "folder-02@2x.webp",
    "folder-03@2x.webp",
    "folder-04@2x.webp",
    "folder-05@2x.webp",
    "folder-06@2x.webp",
    "folder-07@2x.webp",
  ].map((file) => path.join(root, "public", "folders", file)),
} as const;

export function clampReveal(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

function luminance(red: number, green: number, blue: number): number {
  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
}

function pixelIndex(x: number, y: number, width: number, channels: number): number {
  return (y * width + x) * channels;
}

export function renderAsciiFrame(
  pixels: PixelBuffer,
  sourceWidth: number,
  sourceHeight: number,
  columns: number,
  rows: number,
  reveal: number,
): string {
  if (sourceWidth < 1 || sourceHeight < 1 || columns < 1 || rows < 1) {
    throw new Error("ASCII frame dimensions must be positive.");
  }

  const pixelCount = sourceWidth * sourceHeight;
  if (pixels.length % pixelCount !== 0) {
    throw new Error("The raw pixel buffer does not match the source dimensions.");
  }

  const channels = pixels.length / pixelCount;
  if (channels < 3) {
    throw new Error("ASCII rendering requires at least RGB pixel data.");
  }

  const normalizedReveal = clampReveal(reveal);
  const threshold = 0.9 - 0.78 * normalizedReveal;
  const lines: string[] = [];

  for (let row = 0; row < rows; row += 1) {
    let line = "";
    const sourceY = Math.min(
      sourceHeight - 1,
      Math.floor(((row + 0.5) * sourceHeight) / rows),
    );

    for (let column = 0; column < columns; column += 1) {
      const sourceX = Math.min(
        sourceWidth - 1,
        Math.floor(((column + 0.5) * sourceWidth) / columns),
      );
      const offset = pixelIndex(sourceX, sourceY, sourceWidth, channels);
      const alpha = channels >= 4 ? pixels[offset + 3] / 255 : 1;
      const ink = (1 - luminance(pixels[offset], pixels[offset + 1], pixels[offset + 2])) * alpha;

      if (ink <= threshold) {
        line += ASCII_RAMP[0];
        continue;
      }

      const density = clampReveal((ink - threshold) / (1 - threshold));
      const rampIndex =
        density >= 0.8
          ? ASCII_RAMP.length - 1
          : Math.min(ASCII_RAMP.length - 1, Math.max(1, Math.round(density * (ASCII_RAMP.length - 1))));
      line += ASCII_RAMP[rampIndex];
    }

    lines.push(line.replace(/\s+$/u, "") || "\u200B");
  }

  return lines.join("\n");
}

async function resizedAsset(spec: CompositeSpec): Promise<{ input: Buffer; left: number; top: number }> {
  return {
    input: await sharp(spec.file).resize({ width: spec.width }).toBuffer(),
    left: spec.left,
    top: spec.top,
  };
}

async function createScene(): Promise<{ pixels: PixelBuffer; width: number; height: number }> {
  const folderPositions: readonly Omit<CompositeSpec, "file">[] = [
    { width: 62, left: 8, top: 42 },
    { width: 54, left: 70, top: 18 },
    { width: 50, left: 151, top: 67 },
    { width: 45, left: 242, top: 25 },
    { width: 46, left: 27, top: 97 },
    { width: 54, left: 117, top: 30 },
    { width: 48, left: 213, top: 91 },
  ];
  const folderSpecs: readonly CompositeSpec[] = optimizedAssets.folders.map((file, index) => ({
    file,
    ...folderPositions[index],
  }));

  const compositeInputs = await Promise.all([
    resizedAsset({ file: optimizedAssets.paper, width: SCENE_WIDTH, left: 0, top: 0 }),
    resizedAsset({ file: optimizedAssets.grass, width: SCENE_WIDTH, left: 0, top: 5 }),
    ...folderSpecs.map(resizedAsset),
  ]);

  const scene = sharp({
    create: {
      width: SCENE_WIDTH,
      height: SCENE_HEIGHT,
      channels: 4,
      background: { r: 234, g: 233, b: 229, alpha: 1 },
    },
  }).composite(compositeInputs);
  const raw = await scene.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  return {
    pixels: raw.data,
    width: raw.info.width,
    height: raw.info.height,
  };
}

async function assertInputsExist(): Promise<void> {
  const inputs = [optimizedAssets.paper, optimizedAssets.grass, ...optimizedAssets.folders];
  await Promise.all(
    inputs.map(async (file) => {
      const details = await stat(file);
      if (!details.isFile()) {
        throw new Error(`ASCII input is not a file: ${path.relative(root, file)}`);
      }
    }),
  );
}

export async function buildAscii(): Promise<AsciiManifest> {
  await assertInputsExist();
  const scene = await createScene();
  await rm(asciiDirectory, { force: true, recursive: true });
  await mkdir(asciiDirectory, { recursive: true });

  const frames: FrameManifestEntry[] = [];
  for (const [index, reveal] of FRAME_REVEALS.entries()) {
    const file = `frame-${String(index).padStart(2, "0")}.txt`;
    const frame = renderAsciiFrame(
      scene.pixels,
      scene.width,
      scene.height,
      FRAME_COLUMNS,
      FRAME_ROWS,
      reveal,
    );
    const serializedFrame = `${frame.trimEnd()}\n`;
    await writeFile(path.join(asciiDirectory, file), serializedFrame, "utf8");
    frames.push({ file: `/ascii/${file}`, progress: reveal });
  }

  const manifest: AsciiManifest = {
    version: 1,
    columns: FRAME_COLUMNS,
    rows: FRAME_ROWS,
    frames,
  };
  await writeFile(
    path.join(asciiDirectory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  return manifest;
}

async function main(): Promise<void> {
  const manifest = await buildAscii();
  console.log(
    `Generated ${manifest.frames.length} deterministic ASCII frames at ` +
      `${path.relative(root, asciiDirectory).replaceAll(path.sep, "/")}.`,
  );
}

const invokedFile = process.argv[1] === undefined ? undefined : path.resolve(process.argv[1]);
if (invokedFile === fileURLToPath(import.meta.url)) {
  await main();
}

import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

type AssetKind = "folder" | "paper";

type AssetSpec = {
  readonly input: string;
  readonly outputStem: string;
  readonly kind: AssetKind;
};

type Bounds = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
};

type OutputReport = {
  readonly file: string;
  readonly width: number;
  readonly height: number;
  readonly bytes: number;
};

type AssetReport = {
  readonly source: string;
  readonly kind: AssetKind;
  readonly sourceWidth: number;
  readonly sourceHeight: number;
  readonly sourceBytes: number;
  readonly alphaBounds: Bounds;
  readonly outputs: readonly OutputReport[];
};

const root = process.cwd();
const sourceDir = path.join(root, "design", "source");
const publicDir = path.join(root, "public");
const reportPath = path.join(root, "docs", "asset-report.json");

const assets: readonly AssetSpec[] = [
  {
    input: "Desain tanpa judul (1).png",
    outputStem: "folder-01",
    kind: "folder",
  },
  {
    input: "Desain tanpa judul (2).png",
    outputStem: "folder-02",
    kind: "folder",
  },
  {
    input: "Desain tanpa judul (3).png",
    outputStem: "folder-03",
    kind: "folder",
  },
  {
    input: "Desain tanpa judul (4).png",
    outputStem: "folder-04",
    kind: "folder",
  },
  {
    input: "Desain tanpa judul (5).png",
    outputStem: "folder-05",
    kind: "folder",
  },
  {
    input: "Desain tanpa judul (6).png",
    outputStem: "folder-06",
    kind: "folder",
  },
  {
    input: "Desain tanpa judul (7).png",
    outputStem: "folder-07",
    kind: "folder",
  },
  {
    input: "Desain tanpa judul.png",
    outputStem: "footer-paper",
    kind: "paper",
  },
  {
    input: "Group 1.png",
    outputStem: "footer-grass",
    kind: "paper",
  },
];

function outputDirectory(kind: AssetKind): string {
  return path.join(publicDir, kind === "folder" ? "folders" : "paper");
}

function findAlphaBounds(data: Buffer, width: number, height: number, channels: number): Bounds {
  const alphaChannel = channels - 1;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * channels + alphaChannel];
      if (alpha === 0) {
        continue;
      }

      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) {
    throw new Error("The source image has no non-transparent pixels.");
  }

  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  };
}

async function encodeOutput(
  sourcePath: string,
  bounds: Bounds,
  outputPath: string,
  width: number,
  height: number,
): Promise<OutputReport> {
  await sharp(sourcePath)
    .extract(bounds)
    .resize({ width, height, fit: "fill", kernel: "lanczos3" })
    .webp({ quality: 90, alphaQuality: 100, effort: 5 })
    .toFile(outputPath);

  const outputStats = await stat(outputPath);
  return {
    file: path.relative(root, outputPath).replaceAll(path.sep, "/"),
    width,
    height,
    bytes: outputStats.size,
  };
}

async function processAsset(spec: AssetSpec): Promise<AssetReport> {
  const sourcePath = path.join(sourceDir, spec.input);
  const sourceStats = await stat(sourcePath);
  const sourceMetadata = await sharp(sourcePath).metadata();
  const raw = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bounds = findAlphaBounds(raw.data, raw.info.width, raw.info.height, raw.info.channels);
  const outputDir = outputDirectory(spec.kind);
  await mkdir(outputDir, { recursive: true });

  const oneXWidth = Math.max(1, Math.ceil(bounds.width / 2));
  const oneXHeight = Math.max(1, Math.ceil(bounds.height / 2));
  const oneXPath = path.join(outputDir, `${spec.outputStem}.webp`);
  const twoXPath = path.join(outputDir, `${spec.outputStem}@2x.webp`);
  const outputs = await Promise.all([
    encodeOutput(sourcePath, bounds, oneXPath, oneXWidth, oneXHeight),
    encodeOutput(sourcePath, bounds, twoXPath, bounds.width, bounds.height),
  ]);

  if (sourceMetadata.width === undefined || sourceMetadata.height === undefined) {
    throw new Error(`Could not read dimensions for ${spec.input}.`);
  }

  return {
    source: path.join("design/source", spec.input).replaceAll(path.sep, "/"),
    kind: spec.kind,
    sourceWidth: sourceMetadata.width,
    sourceHeight: sourceMetadata.height,
    sourceBytes: sourceStats.size,
    alphaBounds: bounds,
    outputs,
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function main(): Promise<void> {
  const sourceFiles = (await readdir(sourceDir)).filter((file) => file.toLowerCase().endsWith(".png"));
  const expectedFiles = new Set(assets.map((asset) => asset.input));
  const unexpectedFiles = sourceFiles.filter((file) => !expectedFiles.has(file));
  if (unexpectedFiles.length > 0) {
    throw new Error(`Unmapped PNG source file(s): ${unexpectedFiles.join(", ")}`);
  }
  if (sourceFiles.length !== assets.length) {
    throw new Error(`Expected ${assets.length} source PNGs, found ${sourceFiles.length}.`);
  }

  const reports = await Promise.all(assets.map((asset) => processAsset(asset)));
  const report = {
    generatedBy: "scripts/trim-assets.ts",
    format: "WebP",
    scaleRule: "1x is half the trimmed source dimensions; 2x preserves trimmed source dimensions.",
    assets: reports,
  };
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("Asset trim report");
  console.log("==================");
  for (const asset of reports) {
    const outputBytes = asset.outputs.reduce((total, output) => total + output.bytes, 0);
    console.log(
      `${asset.source}: ${asset.sourceWidth}x${asset.sourceHeight}, ${formatBytes(asset.sourceBytes)} -> ` +
        `${asset.alphaBounds.width}x${asset.alphaBounds.height}, ${formatBytes(outputBytes)} total`,
    );
    for (const output of asset.outputs) {
      console.log(`  ${output.file}: ${output.width}x${output.height}, ${formatBytes(output.bytes)}`);
    }
  }
  console.log(`Report: ${path.relative(root, reportPath).replaceAll(path.sep, "/")}`);
}

await main();

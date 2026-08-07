"""Bake the canonical whale emblem into a generated full-frame PNG."""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def extract_emblem(source: Image.Image) -> tuple[Image.Image, tuple[int, int]]:
    rgba = np.asarray(source.convert("RGBA"))
    x0, y0, x1, y1 = 190, 365, 260, 425
    roi = rgba[y0:y1, x0:x1]
    candidate = ((roi[:, :, 3] > 8) & (roi[:, :, :3].min(axis=2) < 228)).astype(np.uint8)
    _, labels = cv2.connectedComponents(candidate, connectivity=8)
    seed = (218 - x0, 388 - y0)
    component = labels[seed[1], seed[0]]
    if component == 0:
        raise RuntimeError("Emblem seed did not land on the canonical emblem")

    mask = np.where(labels == component, 255, 0).astype(np.uint8)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    filled = np.zeros_like(mask)
    cv2.drawContours(filled, contours, -1, 255, thickness=cv2.FILLED)
    filled = cv2.GaussianBlur(filled, (0, 0), 0.35)
    ys, xs = np.where(filled > 8)
    left, top = max(0, xs.min() - 3), max(0, ys.min() - 3)
    right, bottom = min(filled.shape[1], xs.max() + 4), min(filled.shape[0], ys.max() + 4)
    patch = Image.fromarray(np.dstack((roi[:, :, :3], filled)), "RGBA").crop((left, top, right, bottom))
    return patch, (x0 + left, y0 + top)


def stamp(source_path: Path, target_path: Path, output_path: Path) -> None:
    emblem, (left, top) = extract_emblem(Image.open(source_path))
    target = Image.open(target_path).convert("RGBA")
    target.alpha_composite(emblem, (left, top))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    target.save(output_path, optimize=True)
    print(output_path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("target", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    stamp(args.source, args.target, args.output)


if __name__ == "__main__":
    main()

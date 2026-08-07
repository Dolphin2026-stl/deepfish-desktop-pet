"""Align one transparent pet frame to another frame's visible bounds."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def visible_bounds(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = np.asarray(image.getchannel("A"))
    ys, xs = np.where(alpha > 8)
    if not len(xs):
        raise RuntimeError("Frame has no visible pixels")
    return int(xs.min()), int(ys.min()), int(xs.max() + 1), int(ys.max() + 1)


def align_frame(frame: Image.Image, reference: Image.Image) -> Image.Image:
    frame = frame.convert("RGBA")
    reference = reference.convert("RGBA")
    if frame.size != reference.size:
        raise ValueError("Frame and reference canvases must have the same size")

    source_bounds = visible_bounds(frame)
    target_bounds = visible_bounds(reference)
    content = frame.crop(source_bounds).resize(
        (target_bounds[2] - target_bounds[0], target_bounds[3] - target_bounds[1]),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    canvas.alpha_composite(content, target_bounds[:2])
    return canvas


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("reference", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    align_frame(Image.open(args.input), Image.open(args.reference)).save(args.output, optimize=True)
    print(args.output)


if __name__ == "__main__":
    main()

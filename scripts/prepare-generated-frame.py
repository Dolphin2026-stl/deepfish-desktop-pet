"""Convert a white-background generated character image into an anchored pet frame."""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def remove_border_background(image: Image.Image) -> Image.Image:
    rgb = np.asarray(image.convert("RGB"))
    channel_range = rgb.max(axis=2) - rgb.min(axis=2)
    background_candidate = (rgb.min(axis=2) >= 215) & (channel_range <= 38)

    _, labels = cv2.connectedComponents(background_candidate.astype(np.uint8), connectivity=8)
    edge_labels = np.unique(
        np.concatenate((labels[0], labels[-1], labels[:, 0], labels[:, -1]))
    )
    edge_labels = edge_labels[edge_labels != 0]
    background = np.isin(labels, edge_labels)
    alpha = np.where(background, 0, 255).astype(np.uint8)
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.55)

    rgba = np.dstack((rgb, alpha))
    rgba[alpha == 0, :3] = 0
    return Image.fromarray(rgba, "RGBA")


def fit_to_canvas(
    image: Image.Image,
    canvas_size: tuple[int, int],
    max_content: tuple[int, int],
) -> Image.Image:
    alpha = np.asarray(image.getchannel("A"))
    ys, xs = np.where(alpha > 8)
    if not len(xs):
        raise RuntimeError("No foreground found after background removal")

    crop = image.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    scale = min(max_content[0] / crop.width, max_content[1] / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    x = (canvas_size[0] - crop.width) // 2
    y = canvas_size[1] - crop.height
    canvas.alpha_composite(crop, (x, y))
    return canvas


def make_motion_variant(frame: Image.Image) -> Image.Image:
    """Create a subtle whole-body sway while keeping the foot anchor stable."""
    return frame.rotate(
        -1.2,
        resample=Image.Resampling.BICUBIC,
        center=(frame.width // 2, frame.height - 1),
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--width", type=int, default=438)
    parser.add_argument("--height", type=int, default=495)
    parser.add_argument("--max-width", type=int, default=400)
    parser.add_argument("--max-height", type=int, default=485)
    parser.add_argument("--alternate-output", type=Path)
    args = parser.parse_args()

    frame = fit_to_canvas(
        remove_border_background(Image.open(args.input)),
        (args.width, args.height),
        (args.max_width, args.max_height),
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    frame.save(args.output, optimize=True)
    if args.alternate_output:
        args.alternate_output.parent.mkdir(parents=True, exist_ok=True)
        make_motion_variant(frame).save(args.alternate_output, optimize=True)
    print(args.output)


if __name__ == "__main__":
    main()

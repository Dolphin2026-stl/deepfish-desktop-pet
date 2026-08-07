"""Extract one connected character from a white-background reference image."""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def extract(source: Path, seed: tuple[int, int]) -> Image.Image:
    image = Image.open(source).convert("RGBA")
    white = Image.new("RGBA", image.size, "white")
    white.alpha_composite(image)
    rgb = np.asarray(white.convert("RGB"))

    near_white = np.all(rgb > 230, axis=2).astype(np.uint8)
    _, white_labels = cv2.connectedComponents(near_white, connectivity=8)
    edge_labels = np.unique(
        np.concatenate((white_labels[0], white_labels[-1], white_labels[:, 0], white_labels[:, -1]))
    )
    edge_labels = edge_labels[edge_labels != 0]
    background = np.isin(white_labels, edge_labels)
    foreground = (~background).astype(np.uint8)
    _, labels = cv2.connectedComponents(foreground, connectivity=8)
    label = labels[seed[1], seed[0]]
    if label == 0:
        raise RuntimeError("Character seed landed on the background")

    mask = np.where(labels == label, 255, 0).astype(np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    mask = cv2.GaussianBlur(mask, (0, 0), 0.55)
    ys, xs = np.where(mask > 8)
    rgba = Image.fromarray(np.dstack((rgb, mask)), "RGBA")
    return rgba.crop((max(0, xs.min() - 4), max(0, ys.min() - 4), min(rgb.shape[1], xs.max() + 5), min(rgb.shape[0], ys.max() + 5)))


def fit(character: Image.Image) -> Image.Image:
    character.thumbnail((400, 485), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (438, 495), (0, 0, 0, 0))
    canvas.alpha_composite(character, ((canvas.width - character.width) // 2, canvas.height - character.height))
    return canvas


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--seed-x", type=int, required=True)
    parser.add_argument("--seed-y", type=int, required=True)
    args = parser.parse_args()

    frame = fit(extract(args.input, (args.seed_x, args.seed_y)))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    frame.save(args.output, optimize=True)
    print(args.output)


if __name__ == "__main__":
    main()

"""Create a closed-eye idle frame without moving the character or emblem."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


REFERENCE_SIZE = (438, 495)


def scaled_point(point: tuple[float, float], size: tuple[int, int], scale: int) -> tuple[int, int]:
    x = point[0] * size[0] / REFERENCE_SIZE[0]
    y = point[1] * size[1] / REFERENCE_SIZE[1]
    return round(x * scale), round(y * scale)


def quadratic_points(
    start: tuple[float, float],
    control: tuple[float, float],
    end: tuple[float, float],
    size: tuple[int, int],
    scale: int,
) -> list[tuple[int, int]]:
    points = []
    for step in range(25):
        t = step / 24
        x = (1 - t) ** 2 * start[0] + 2 * (1 - t) * t * control[0] + t**2 * end[0]
        y = (1 - t) ** 2 * start[1] + 2 * (1 - t) * t * control[1] + t**2 * end[1]
        points.append(scaled_point((x, y), size, scale))
    return points


def create_blink(source: Image.Image) -> Image.Image:
    source = source.convert("RGBA")
    scale = 4
    mask = Image.new("L", (source.width * scale, source.height * scale), 0)
    mask_draw = ImageDraw.Draw(mask)
    skin = (251, 239, 234, 255)
    lash = (73, 39, 53, 255)

    eyes = (
        ((128, 203), (187, 256), (135, 228), (158, 243), (181, 228), -1),
        ((232, 203), (293, 256), (239, 228), (263, 243), (287, 228), 1),
    )
    for top_left, bottom_right, start, control, end, direction in eyes:
        box = (*scaled_point(top_left, source.size, scale), *scaled_point(bottom_right, source.size, scale))
        mask_draw.ellipse(box, fill=255)

    mask = mask.filter(ImageFilter.GaussianBlur(1.5 * scale)).resize(source.size, Image.Resampling.LANCZOS)
    source = Image.composite(Image.new("RGBA", source.size, skin), source, mask)

    overlay = Image.new("RGBA", (source.width * scale, source.height * scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for _top_left, _bottom_right, start, control, end, direction in eyes:
        eyelid = quadratic_points(start, control, end, source.size, scale)
        draw.line(eyelid, fill=lash, width=5 * scale, joint="curve")
        outer = eyelid[0] if direction < 0 else eyelid[-1]
        draw.line(
            [outer, (outer[0] + direction * 7 * scale, outer[1] - 5 * scale)],
            fill=lash,
            width=3 * scale,
        )

    overlay = overlay.resize(source.size, Image.Resampling.LANCZOS)
    return Image.alpha_composite(source, overlay)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    create_blink(Image.open(args.input)).save(args.output, optimize=True)
    print(args.output)


if __name__ == "__main__":
    main()

"""Compress large photographic figures while retaining selectable PDF text."""

from pathlib import Path
import logging
import sys

from pypdf import PdfReader, PdfWriter


def main(source: Path, target: Path) -> None:
    logging.getLogger("pypdf").setLevel(logging.ERROR)
    reader = PdfReader(source, strict=False)
    writer = PdfWriter()
    writer.append_pages_from_reader(reader)
    replaced = 0
    for page in writer.pages:
        for image in list(page.images):
            if len(image.data) < 450_000 or image.image.format == "JPEG":
                continue
            image.replace(image.image.convert("RGB"), quality=72)
            replaced += 1
    writer.add_metadata({"/Title": "农村养老服务体系建设及创新研究"})
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("wb") as output:
        writer.write(output)
    print(f"pages={len(writer.pages)} compressed_images={replaced} bytes={target.stat().st_size}")


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))

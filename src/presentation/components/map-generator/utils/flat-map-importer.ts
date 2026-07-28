export class FlatMapImporter {
  public async importFlatMap(
    file: File,
    onSuccess: () => void,
    onError: (msg: string) => void,
  ): Promise<void> {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 4096;
        canvas.height = 2048;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          onError("Canvas rendering context unavailable");
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, 4096, 2048);
        const data = imgData.data;

        const raw = new Uint8Array(4096 * 2048);
        for (let i = 0; i < raw.length; i++) {
          raw[i] = data[i * 4 + 2] || 0;
        }

        try {
          const res = await fetch("/api/map-generator/import-raw", {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
            },
            body: raw,
          });

          const json = await res.json();
          if (json.success) {
            onSuccess();
          } else {
            onError(json.error || "Import process failed");
          }
        } catch {
          onError("Network communication error during raw import");
        }
      };
    };

    reader.readAsDataURL(file);
  }
}

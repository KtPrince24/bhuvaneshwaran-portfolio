import { useEffect, useState } from "react";

export function useAssetAvailable(src) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!src) {
      setAvailable(false);
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[Portfolio] Asset is missing because no source path was provided. Expected resume at frontend/public/resume.pdf.`);
      }
      return;
    }
    let active = true;
    const check = async () => {
      try {
        const response = await fetch(src, { method: "HEAD", cache: "no-cache" });
        const contentType = response.headers.get("content-type") || "";
        const ok = response.ok && (contentType.includes("pdf") || contentType.includes("octet-stream") || /\.pdf$/i.test(src));
        if (active) {
          setAvailable(ok);
          if (!ok && process.env.NODE_ENV !== "production") {
            console.warn(
              `[Portfolio] Resume PDF not found at ${src}. Place the PDF at frontend/public/resume.pdf ` +
                `(for example, copy Bhuvaneshwaran_Resume.pdf to frontend/public/resume.pdf), then reload. ` +
                `Navigation to the resume is disabled until it is available.`
            );
          }
        }
      } catch {
        if (active) {
          setAvailable(false);
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `[Portfolio] Resume PDF not found at ${src}. Place the PDF at frontend/public/resume.pdf, then reload.`
            );
          }
        }
      }
    };
    check();
    return () => {
      active = false;
    };
  }, [src]);

  return available;
}

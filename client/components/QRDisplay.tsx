import React from "react";

export default function QRDisplay({ value, size = 160 }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&margin=2`;
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="rounded-xl border-2 border-border bg-white p-2 shadow-sm">
        <img
          src={src}
          alt="QR Code"
          width={size}
          height={size}
          className="rounded"
        />
      </div>
    </div>
  );
}

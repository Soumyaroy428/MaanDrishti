import React, { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { DISTRICT_COORDS } from "@/lib/geo";
import type { EntityRecord } from "@/lib/api-client";

const MapWithProps = MapContainer as unknown as React.ComponentType<
  React.PropsWithChildren<Record<string, unknown>>
>;
const TileWithProps = TileLayer as unknown as React.ComponentType<
  React.PropsWithChildren<Record<string, unknown>>
>;
const MarkerWithProps = CircleMarker as unknown as React.ComponentType<
  React.PropsWithChildren<Record<string, unknown>>
>;
const PopupWithProps = Popup as unknown as React.ComponentType<
  React.PropsWithChildren<Record<string, unknown>>
>;

function colorFor(rate: number) {
  if (rate >= 75) return "#10b981";
  if (rate >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function DistrictComplianceMap({
  instruments = [],
}: {
  instruments?: EntityRecord[];
}) {
  const stats = useMemo(() => {
    const acc: Record<string, { total: number; verified: number }> = {};
    instruments.forEach((inst) => {
      const d = inst.district;
      if (!d || !DISTRICT_COORDS[d]) return;
      if (!acc[d]) acc[d] = { total: 0, verified: 0 };
      acc[d].total += 1;
      if (inst.status === "verified") acc[d].verified += 1;
    });
    return Object.entries(acc).map(([district, s]) => ({
      district,
      ...s,
      rate: Math.round((s.verified / s.total) * 100),
      coords: DISTRICT_COORDS[district],
    }));
  }, [instruments]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> ≥75%
          compliant
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> 50–74%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> &lt;50%
        </span>
        <span className="ml-auto">Marker size = instrument count</span>
      </div>
      {stats.length === 0 ? (
        <div className="flex items-center justify-center h-[320px] rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          No district data available yet
        </div>
      ) : (
        <MapWithProps
          center={[23.3, 87.9]}
          zoom={7}
          scrollWheelZoom={false}
          className="h-[340px] sm:h-[440px] w-full rounded-xl border border-border z-0"
        >
          <TileWithProps
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {stats.map((s) => (
            <MarkerWithProps
              key={s.district}
              center={s.coords}
              radius={Math.min(12 + s.total * 3, 28)}
              pathOptions={{
                color: colorFor(s.rate),
                fillColor: colorFor(s.rate),
                fillOpacity: 0.45,
                weight: 2,
              }}
            >
              <PopupWithProps>
                <div className="font-semibold">{s.district}</div>
                Instruments: {s.total}
                <br />
                Verified: {s.verified}
                <br />
                Compliance: <b>{s.rate}%</b>
              </PopupWithProps>
            </MarkerWithProps>
          ))}
        </MapWithProps>
      )}
    </div>
  );
}

import React, { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Clock } from "lucide-react";
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

const INSPECTOR_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
];

export default function InspectorScheduleMap({
  applications = [],
  instruments = [],
}: {
  applications?: EntityRecord[];
  instruments?: EntityRecord[];
}) {
  const pins = useMemo(() => {
    const colorMap = {};
    let ci = 0;
    return applications
      .filter((a) => a.assigned_inspector && a.inspection_date)
      .map((a, idx) => {
        const inst = instruments.find(
          (i) => i.instrument_id === a.instrument_id,
        );
        const base =
          inst?.latitude && inst?.longitude
            ? [inst.latitude, inst.longitude]
            : DISTRICT_COORDS[inst?.district];
        if (!base) return null;
        if (!colorMap[a.assigned_inspector]) {
          colorMap[a.assigned_inspector] =
            INSPECTOR_COLORS[ci++ % INSPECTOR_COLORS.length];
        }
        const jitter = (idx % 4) * 0.02 - 0.03;
        return {
          ...a,
          position: [base[0] + jitter, base[1] + jitter],
          color: colorMap[a.assigned_inspector],
          location: inst?.location || inst?.district,
        };
      })
      .filter(Boolean);
  }, [applications, instruments]);

  if (pins.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No scheduled inspections yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <MapWithProps
        center={[23.3, 87.9]}
        zoom={7}
        scrollWheelZoom={false}
        className="h-[320px] sm:h-[400px] w-full rounded-xl border border-border z-0"
      >
        <TileWithProps
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((p) => (
          <MarkerWithProps
            key={p.id}
            center={p.position}
            radius={11}
            pathOptions={{
              color: p.color,
              fillColor: p.color,
              fillOpacity: 0.55,
              weight: 2,
            }}
          >
            <PopupWithProps>
              <div className="font-semibold">{(p as EntityRecord).assigned_inspector}</div>
              {(p as EntityRecord).instrument_id}
              <br />
              {p.location}
              <br />
              {(p as EntityRecord).inspection_date} · {(p as EntityRecord).time_slot || "Slot TBD"}
            </PopupWithProps>
          </MarkerWithProps>
        ))}
      </MapWithProps>
      <div className="space-y-2">
        {pins.map((p) => (
          <div
            key={`row-${p.id}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {(p as EntityRecord).assigned_inspector} ·{" "}
                <span className="font-mono text-xs text-muted-foreground">
                  {(p as EntityRecord).instrument_id}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {(p as EntityRecord).inspection_date} — {p.location}
              </p>
            </div>
            {(p as EntityRecord).time_slot && (
              <span
                className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: p.color }}
              >
                <Clock className="h-3 w-3" /> {(p as EntityRecord).time_slot}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

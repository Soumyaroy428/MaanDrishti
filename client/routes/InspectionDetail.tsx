import React, { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  Brain,
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  Video,
  MapPin,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";

export default function InspectionDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const appId = params.get("appId");
  const instId = params.get("instId");

  const [instrument, setInstrument] = useState(null);
  const [rules, setRules] = useState([]);
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    inspector_name: "",
    inspection_date: new Date().toISOString().slice(0, 10),
    expected_measurement: "",
    observed_measurement: "",
    unit: "kg",
    location: "",
    notes: "",
    photo_url: "",
    video_url: "",
  });
  const [calc, setCalc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [aeveRunning, setAeveRunning] = useState(false);
  const [aeveResult, setAeveResult] = useState(null);

  useEffect(() => {
    Promise.all([
      api.entities.Instrument.list(),
      api.entities.ToleranceRule.filter({ active: true }),
    ]).then(([insts, r]) => {
      setRules(r);
      if (instId) {
        const inst = insts.find((i) => i.instrument_id === instId);
        setInstrument(inst);
        setForm((f) => ({ ...f, location: inst?.location || "" }));
      }
      setLoading(false);
    });
  }, [instId]);

  useEffect(() => {
    if (!isNew && id) {
      api.entities.Inspection.get(id).then((data) => {
        setExisting(data);
        setForm({
          inspector_name: data.inspector_name || "",
          inspection_date: data.inspection_date || "",
          expected_measurement: data.expected_measurement || "",
          observed_measurement: data.observed_measurement || "",
          unit: data.unit || "kg",
          location: data.location || "",
          notes: data.notes || "",
          photo_url: data.photo_url || "",
          video_url: data.video_url || "",
        });
        if (data.aeve_status === "complete") {
          setAeveResult({
            confidence: data.aeve_confidence,
            result: data.aeve_result,
            reasons: data.aeve_reasons,
            findings: data.aeve_findings,
          });
        }
        api.entities.Instrument.list().then((insts) => {
          setInstrument(
            insts.find((i) => i.instrument_id === data.instrument_id),
          );
        });
      });
    }
  }, [id, isNew]);

  // Verification engine — live calculation
  useEffect(() => {
    const exp = parseFloat(form.expected_measurement);
    const obs = parseFloat(form.observed_measurement);
    if (!isNaN(exp) && !isNaN(obs) && exp !== 0) {
      const error = obs - exp;
      const errorPct = Math.abs((error / exp) * 100);
      const applicableRule = rules.find(
        (r) => r.instrument_type === instrument?.instrument_type,
      );
      const tolerance = applicableRule?.tolerance_percentage ?? 1;
      const result = errorPct <= tolerance ? "pass" : "fail";
      setCalc({ error, errorPct, tolerance, result, rule: applicableRule });
    } else {
      setCalc(null);
    }
  }, [form.expected_measurement, form.observed_measurement, rules, instrument]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const runAEVE = async (inspectionData) => {
    setAeveRunning(true);
    try {
      const response = await api.functions.invoke("runAeveAnalysis", {
        instrumentType: instrument?.instrument_type,
        manufacturer: instrument?.manufacturer,
        model: instrument?.model,
        serial: instrument?.serial_number,
        expected: inspectionData.expected_measurement,
        observed: inspectionData.observed_measurement,
        unit: inspectionData.unit,
        errorValue: parseFloat(
          (
            inspectionData.observed_measurement -
            inspectionData.expected_measurement
          ).toFixed(4),
        ),
        errorPercentage: parseFloat(
          Math.abs(
            ((inspectionData.observed_measurement -
              inspectionData.expected_measurement) /
              inspectionData.expected_measurement) *
              100,
          ).toFixed(3),
        ),
        inspectorResult: inspectionData.result,
        hasPhoto: !!inspectionData.photo_url,
        hasVideo: !!inspectionData.video_url,
        location: inspectionData.location,
      });
      const res = response.data;
      setAeveResult(res);
      return res;
    } catch (e) {
      const fallback = {
        result: "insufficient_evidence",
        confidence: 40,
        reasons: "AEVE analysis unavailable",
        findings: "Could not complete AI analysis. Manual review required.",
      };
      setAeveResult(fallback);
      return fallback;
    } finally {
      setAeveRunning(false);
    }
  };

  const submit = async () => {
    if (
      !form.inspector_name ||
      !form.expected_measurement ||
      !form.observed_measurement
    )
      return;
    setSaving(true);
    const exp = parseFloat(form.expected_measurement);
    const obs = parseFloat(form.observed_measurement);
    const error = obs - exp;
    const errorPct = Math.abs((error / exp) * 100);
    const rule = rules.find(
      (r) => r.instrument_type === instrument?.instrument_type,
    );
    const tolerance = rule?.tolerance_percentage ?? 1;
    const inspectorResult = errorPct <= tolerance ? "pass" : "fail";

    const inspectionData = {
      ...form,
      expected_measurement: exp,
      observed_measurement: obs,
      application_id: appId || "",
      instrument_id: instId || existing?.instrument_id || "",
      error_value: parseFloat(error.toFixed(4)),
      error_percentage: parseFloat(errorPct.toFixed(4)),
      tolerance_limit: tolerance,
      result: inspectorResult,
      aeve_status: "processing",
    };

    let created;
    if (isNew) {
      created = await api.entities.Inspection.create(inspectionData);
    } else {
      created = await api.entities.Inspection.update(id, inspectionData);
    }

    // Run AEVE
    const aeve = await runAEVE({ ...inspectionData, result: inspectorResult });
    const conflict =
      (aeve.result === "potential_failure" && inspectorResult === "pass") ||
      (aeve.result === "pass" && inspectorResult === "fail");

    await api.entities.Inspection.update(created.id, {
      aeve_status: "complete",
      aeve_confidence: aeve.confidence,
      aeve_result: aeve.result,
      aeve_reasons: aeve.reasons,
      aeve_findings: aeve.findings,
      conflict_flag: conflict,
      result: conflict ? "review" : inspectorResult,
    });

    // Update application status
    if (appId) {
      await api.entities.Application.update(appId, {
        status: conflict ? "government_review" : "inspection_complete",
      });
    }

    setSaving(false);
    navigate("/inspections");
  };

  if (loading)
    return (
      <div className="text-center py-16 text-sm text-muted-foreground">
        Loading…
      </div>
    );

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <Link
        to="/inspections"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {isNew ? "New Inspection" : "Inspection Record"}
        </h1>
        {instrument && (
          <p className="mt-1 text-sm text-muted-foreground">
            {instrument.instrument_id} · {instrument.manufacturer}{" "}
            {instrument.model} · {instrument.owner_name}
          </p>
        )}
      </div>

      {/* Inspector info */}
      <Section title="Inspector & Location">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Inspector Name"
            value={form.inspector_name}
            onChange={(v) => set("inspector_name", v)}
            required
          />
          <Input
            label="Inspection Date"
            type="date"
            value={form.inspection_date}
            onChange={(v) => set("inspection_date", v)}
          />
        </div>
        <Input
          label="Location"
          value={form.location}
          onChange={(v) => set("location", v)}
          icon={<MapPin className="h-4 w-4" />}
        />
      </Section>

      {/* Verification Engine */}
      <Section title="Measurement & Verification Engine" icon={Calculator}>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Expected"
            type="number"
            value={form.expected_measurement}
            onChange={(v) => set("expected_measurement", v)}
            required
          />
          <Input
            label="Observed"
            type="number"
            value={form.observed_measurement}
            onChange={(v) => set("observed_measurement", v)}
            required
          />
          <div>
            <label className="text-sm font-medium">Unit</label>
            <select
              value={form.unit}
              onChange={(e) => set("unit", e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="L">L</option>
              <option value="m">m</option>
              <option value="ml">ml</option>
            </select>
          </div>
        </div>

        {calc && (
          <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">
                Verification Engine Result
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <Metric
                label="Error"
                value={`${calc.error > 0 ? "+" : ""}${calc.error.toFixed(4)} ${form.unit}`}
              />
              <Metric label="Error %" value={`${calc.errorPct.toFixed(3)}%`} />
              <Metric label="Tolerance" value={`${calc.tolerance}%`} />
              <div>
                <p className="text-xs text-muted-foreground">Result</p>
                <div className="mt-1">
                  <StatusBadge status={calc.result} />
                </div>
              </div>
            </div>
            {calc.rule ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Rule:{" "}
                {calc.rule.description ||
                  `${calc.rule.instrument_type} — ${calc.rule.tolerance_percentage}% tolerance`}
              </p>
            ) : (
              <p className="mt-3 text-xs text-amber-600">
                No tolerance rule configured for this instrument type — using
                default 1%
              </p>
            )}
          </div>
        )}
      </Section>

      {/* Evidence */}
      <Section title="Evidence Capture" icon={Camera}>
        <Input
          label="Photo URL"
          value={form.photo_url}
          onChange={(v) => set("photo_url", v)}
          placeholder="https://…"
        />
        <Input
          label="Video URL"
          value={form.video_url}
          onChange={(v) => set("video_url", v)}
          placeholder="https://…"
          icon={<Video className="h-4 w-4" />}
        />
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg border-2 border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            <Camera className="mx-auto h-5 w-5 mb-1" /> Photo evidence
          </div>
          <div className="flex-1 rounded-lg border-2 border-dashed border-border p-3 text-center text-xs text-muted-foreground">
            <Video className="mx-auto h-5 w-5 mb-1" /> Video evidence
          </div>
        </div>
      </Section>

      {/* AEVE */}
      {(existing?.aeve_status === "complete" || aeveResult) && (
        <Section title="AEVE — AI Evidence Verification" icon={Brain}>
          {aeveRunning ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100">
              <div className="h-5 w-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
              <p className="text-sm text-purple-700">
                Analyzing evidence with computer vision…
              </p>
            </div>
          ) : aeveResult ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge status={aeveResult.result} />
                  {existing?.conflict_flag && <StatusBadge status="review" />}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-bold text-purple-600">
                    {aeveResult.confidence}%
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-purple-50/50 border border-purple-100 p-3">
                <p className="text-xs font-semibold text-purple-900">
                  {aeveResult.reasons}
                </p>
                <p className="mt-1 text-xs text-purple-700">
                  {aeveResult.findings}
                </p>
              </div>
              {existing?.conflict_flag && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    Conflict detected between inspector result and AEVE
                    assessment. Routed to government review.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </Section>
      )}

      <Input
        label="Inspector Notes"
        value={form.notes}
        onChange={(v) => set("notes", v)}
      />

      {isNew && (
        <Button
          onClick={submit}
          disabled={
            saving ||
            !form.inspector_name ||
            !form.expected_measurement ||
            !form.observed_measurement
          }
          className="w-full"
          size="lg"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />{" "}
              Running AEVE analysis…
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> Submit & Run AEVE
            </>
          )}
        </Button>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  icon,
}) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      <div className="relative mt-1">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-input bg-card ${icon ? "pl-9" : "px-3"} pr-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold text-sm">{value}</p>
    </div>
  );
}

import { Request, Response } from "express";

export const runAeveAnalysis = (request: Request, response: Response) => {
  const { readings = [], notes = "" } = request.body as {
    readings?: unknown[];
    notes?: string;
  };
  response.json({
    status: "completed",
    summary: notes || "Analysis completed.",
    findings: Array.isArray(readings) ? readings : [],
  });
};

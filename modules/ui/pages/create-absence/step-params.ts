import { Isomorphism } from "@atomic-object/lenses";

export type Step = "absence" | "preAssignSub" | "edit" | "confirmation";

export type StepParam = {
  step: string;
};

export const StepParamDefaults: StepParam = {
  step: "absence",
};

export const StepParamIso: Isomorphism<StepParam, Step> = {
  to(k) {
    switch (k.step) {
      case "absence":
      case "preAssignSub":
      case "edit":
      case "confirmation":
        return k.step;
      default:
        return "absence";
    }
  },
  from(s) {
    return { step: s };
  },
};

export const StepParams = {
  defaults: StepParamDefaults,
  iso: StepParamIso,
};

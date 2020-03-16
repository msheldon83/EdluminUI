import { Isomorphism } from "@atomic-object/lenses";

export type Step = "absence" | "preAssignSub" | "edit" | "confirmation";

export type VacancyStep = "vacancy" | "preAssignSub" | "edit" | "confirmation";

export type StepParam = {
  step: string;
};

export const StepParamDefaults: StepParam = {
  step: "absence",
};

export const VacancyStepParamDefaults: StepParam = {
  step: "vacancy",
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

export const VacancyStepParamIso: Isomorphism<StepParam, VacancyStep> = {
  to(k) {
    switch (k.step) {
      case "vacancy":
      case "preAssignSub":
      case "edit":
      case "confirmation":
        return k.step;
      default:
        return "vacancy";
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

export const VacancyStepParams = {
  defaults: VacancyStepParamDefaults,
  iso: VacancyStepParamIso,
};

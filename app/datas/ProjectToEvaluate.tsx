import { FakeProject } from "./ProjectList";

export const ProjectToEvaluate = FakeProject.filter((e) => {
  return !e.notefinale && (e.rank === null || e.rank === undefined || !e.rank);
});
import { Mark } from "@mui/material/Slider/useSlider.types";

export const normalizedMarks: Mark[] = [
  { value: 0 },
  { value: 0.25 },
  { value: 0.5 },
  { value: 0.75 },
  { value: 1 },
];

export const signedNormalizedMarks: Mark[] = [
  { value: -1 },
  { value: -0.5 },
  { value: 0 },
  { value: 0.5 },
  { value: 1 },
];

export const percentMarks: Mark[] = [
  { value: 0 },
  { value: 25 },
  { value: 50 },
  { value: 75 },
  { value: 100 },
];

export const signedPercentMarks: Mark[] = [
  { value: -100 },
  { value: -50 },
  { value: 0 },
  { value: 50 },
  { value: 100 },
];

export const angleDegreeMarks: Mark[] = [
  { value: 0 },
  { value: 45 },
  { value: 90 },
  { value: 135 },
  { value: 180 },
  { value: 225 },
  { value: 270 },
  { value: 315 },
  { value: 360 },
];

export const signedAngleDegreeMarks: Mark[] = [
  { value: -180 },
  { value: -135 },
  { value: -90 },
  { value: -45 },
  { value: 0 },
  { value: 45 },
  { value: 90 },
  { value: 135 },
  { value: 180 },
];

export const speedMarks: Mark[] = [
  { value: 0 },
  { value: 0.5 },
  { value: 1.0 },
  { value: 1.5 },
  { value: 2.0 },
];

export const polygonPointMarks: Mark[] = [
  { value: 3 },
  { value: 4 },
  { value: 5 },
  { value: 6 },
];

export const levelMarks: Mark[] = [{ value: 1 }, { value: 2 }, { value: 3 }];

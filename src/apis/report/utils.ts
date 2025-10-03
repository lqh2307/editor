export function parseStringToType(str: string): number {
  if (str === "report") {
    return 1;
  } else if (str === "template") {
    return 2;
  } else if (str === "component") {
    return 3;
  }
}

export function parseTypeToString(num: number): string {
  if (num === 1) {
    return "report";
  } else if (num === 2) {
    return "template";
  } else if (num === 3) {
    return "component";
  }
}

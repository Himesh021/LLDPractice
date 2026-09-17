export function validateSolutionForm(values: {
  classes: string;
  interfaces: string;
  relationships: string;
  responsibilities: string;
  explanation: string;
}): string | null {
  const filled = Object.values(values).filter((value) => value.trim().length >= 12);
  if (filled.length < 3) {
    return "Fill at least three sections with meaningful detail before submitting.";
  }
  if (values.classes.trim().length < 12) {
    return "Describe the classes you would introduce.";
  }
  if (values.explanation.trim().length < 12) {
    return "Add a short design explanation.";
  }
  return null;
}

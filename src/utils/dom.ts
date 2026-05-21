export function removeElement(selector: string): void {
  document.querySelector(selector)?.remove();
}

export function setThemeVariables(
  element: HTMLElement,
  theme: { primaryColor?: string; backgroundColor?: string; textColor?: string; fontFamily?: string }
): void {
  const variableMap: Record<string, string> = {
    primaryColor: "--cccl-primary-color",
    backgroundColor: "--cccl-background-color",
    textColor: "--cccl-text-color",
    fontFamily: "--cccl-font"
  };

  Object.entries(theme).forEach(([key, value]) => {
    if (value && variableMap[key]) {
      element.style.setProperty(variableMap[key], value);
    }
  });
}

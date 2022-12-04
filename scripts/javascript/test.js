export function draw(importDiretory) {
    const dynamicImport = import(importDiretory);
  return dynamicImport;
}
import { formatName, isNameValid } from "./formatName";

describe("formatName", () => {
  it("formats names with proper capitalization", () => {
    expect(formatName("YuRi SiLVEIRA")).toBe("Yuri Silveira");
    expect(formatName("YURI PIRES")).toBe("Yuri Pires");
  });

  it("validates names without numbers", () => {
    expect(isNameValid("Yuri Pires")).toBe(true);
    expect(isNameValid("Yuri 123")).toBe(false);
  });
});

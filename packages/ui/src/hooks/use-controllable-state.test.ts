import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useControllableState } from "./use-controllable-state";

describe("useControllableState", () => {
  it("uses the default value and updates internal state", () => {
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useControllableState({
        defaultValue: "Hello",
        onChange,
      }),
    );

    expect(result.current[0]).toBe("Hello");

    act(() => {
      result.current[1]("World");
    });

    expect(result.current[0]).toBe("World");
    expect(onChange).toHaveBeenCalledWith("World");
  });

  it("uses the controlled value without updating internal state", () => {
    const onChange = vi.fn();

    const { result, rerender } = renderHook(
      ({ value }) =>
        useControllableState({
          value,
          defaultValue: "Default",
          onChange,
        }),
      {
        initialProps: { value: "Controlled" },
      },
    );

    expect(result.current[0]).toBe("Controlled");

    act(() => {
      result.current[1]("Updated");
    });

    expect(result.current[0]).toBe("Controlled");
    expect(onChange).toHaveBeenCalledWith("Updated");

    rerender({ value: "Updated" });

    expect(result.current[0]).toBe("Updated");
  });

  it("supports updating state without an onChange callback", () => {
    const { result } = renderHook(() =>
      useControllableState({
        defaultValue: "Initial",
      }),
    );

    act(() => {
      result.current[1]("Updated");
    });

    expect(result.current[0]).toBe("Updated");
  });

  it("treats an empty string as a controlled value", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState({ value, defaultValue: "Default" }),
      { initialProps: { value: "Hello" } },
    );

    expect(result.current[0]).toBe("Hello");

    rerender({ value: "" });

    expect(result.current[0]).toBe("");
  });
});

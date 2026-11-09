import { Button } from "../button/button";
import type { ComposerProps } from "./use-composer";
import { useComposer } from "./use-composer";

export function Composer(props: ComposerProps) {
  const { formProps, textareaProps, buttonProps, buttonLabel } = useComposer(props);

  return (
    <form {...formProps}>
      <textarea {...textareaProps} />

      <Button {...buttonProps}>{buttonLabel}</Button>
    </form>
  );
}

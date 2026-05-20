export type SequenceScheme = {
  [key: string]:
    | `${SequenceSchemeEntry}-W|R-${SequenceSchemeEntry}` //testid:next testid if wrong - next testid if correct
    | SequenceSchemeEntry;
} & { __flow_start__: SequenceSchemeEntry };

export type SequenceSchemeEntry = "__flow_finish__" | string | null;

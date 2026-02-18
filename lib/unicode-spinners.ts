/**
 * Local unicode spinner frame data used by lightweight UI indicators.
 * This keeps bundle/runtime predictable without a package dependency.
 */
export interface UnicodeSpinnerDefinition {
  readonly frames: readonly string[];
  readonly interval: number;
}

export const UNICODE_SPINNERS = {
  waverows: {
    frames: [
      "⠖⠉⠉⠑",
      "⡠⠖⠉⠉",
      "⣠⡠⠖⠉",
      "⣄⣠⡠⠖",
      "⠢⣄⣠⡠",
      "⠙⠢⣄⣠",
      "⠉⠙⠢⣄",
      "⠊⠉⠙⠢",
      "⠜⠊⠉⠙",
      "⡤⠜⠊⠉",
      "⣀⡤⠜⠊",
      "⢤⣀⡤⠜",
      "⠣⢤⣀⡤",
      "⠑⠣⢤⣀",
      "⠉⠑⠣⢤",
      "⠋⠉⠑⠣",
    ],
    interval: 90,
  },
} as const satisfies Record<string, UnicodeSpinnerDefinition>;

export type UnicodeSpinnerName = keyof typeof UNICODE_SPINNERS;

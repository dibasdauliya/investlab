declare module "react-katex" {
  import type { ComponentType, ReactNode } from "react";

  export interface BlockMathProps {
    math: string;
    children?: ReactNode;
  }

  export interface InlineMathProps {
    math: string;
    children?: ReactNode;
  }

  export const BlockMath: ComponentType<BlockMathProps>;
  export const InlineMath: ComponentType<InlineMathProps>;
}
